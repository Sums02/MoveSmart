from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import smtplib
from email.message import EmailMessage

#This file handles user authentication, registration, and password reset functionality.

#Router for authentication
router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

#JWT settings
SECRET_KEY = "a3a1f5d14cc442d682d80ef6c3a73c7d9fc8010f5f6cb99b28f229aefb6d2b91"
ALGORITHM = "HS256"

#Password hashing & Token generation
byct_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

#Pydantic models
class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class EmailRequest(BaseModel):
    email: str


#Database dependencies
def depends_on_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(depends_on_db)]



#Creating new user
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_user(create_user_request: CreateUserRequest, db: db_dependency):
    existing_user = db.query(User).filter(User.email == create_user_request.email).first()
    #Check if user already exists
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    #Hash password and save user to db
    create_user_model = User(
        email=create_user_request.email,
        hashed_password=byct_context.hash(create_user_request.password),
    )
    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return {
        "message": "User created successfully",
        "registered": True,
        "email": create_user_model.email
    }

#Login user and generate JWT token
@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: db_dependency):
    #Check if user exists
    user= authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",)
    #If user is found, create a JWT token
    token = create_access_token(user.email, user.id, timedelta(minutes=20))
    return {"access_token": token, "token_type": "bearer"}

#Verifying user credentials
def authenticate_user(db,email: str, password: str ):
    #Find matching user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password")
    #Verify password
    if not byct_context.verify(password, user.hashed_password):
        return False
    return user

#Creating JWT token
def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': email, 'user_id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

#Get current user from token
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        #Check if token is expired
        if email is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
        return {"email": email, "user_id": user_id}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")

#Request password reset
@router.post("/request-reset")
async def request_reset_password(payload: EmailRequest, db: db_dependency):
    email = payload.email
    #Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    #Generate JWT token for password reset
    token = create_access_token(user.email, user.id, timedelta(minutes=15))
    reset_link = f"http://localhost:5173/resetpassword?token={token}"
    #Send email with reset link
    send_reset_email(user.email, reset_link)

    return {
        "message": "Reset link has been generated.",
        "reset_link": reset_link
    }

#Send email with reset link
def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg.set_content(f"Click the following link to reset your password:\n{reset_link}")
    msg["Subject"] = "MoveSmart Password Reset"
    msg["From"] = "youremail@gmail.com"
    msg["To"] = to_email

    #Send via Gmail SMTP
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login("sumayyahmiah02@gmail.com", "fsjo qihb evsa geqa")
            smtp.send_message(msg)
        print("Email sent successfully")
    except Exception as e:
        print("Failed to send email:", e)

#Reset password
@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: db_dependency):
    try:
        #Decode JWT token to get email
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    #Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    #Check if new password is valid
    user.hashed_password = byct_context.hash(data.new_password)
    db.commit()

    return {"message": "Password reset successful"}