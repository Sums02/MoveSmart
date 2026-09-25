
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Annotated
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import auth
from auth import get_current_user
from forecast import router as forecast_router
from listings import router as listings_router
from calculator import router as calculator_router
from database import engine
import os
from dotenv import load_dotenv

load_dotenv()

origins = [
    os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
]



#Mounting routers
app = FastAPI()
app.include_router(auth.router)
app.include_router(forecast_router)
app.include_router(listings_router)
app.include_router(calculator_router)

#Creating the database tables
models.Base.metadata.create_all(bind=engine)
#Dependency to get the database session


#CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Checking if the backend is running
@app.get("/", status_code=status.HTTP_200_OK)
async def root():
    return {"message": "MoveSmart backend is running successfully!"}

#Database dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

#Verifying user credentials
@app.get("/me", status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return {"User": user}



