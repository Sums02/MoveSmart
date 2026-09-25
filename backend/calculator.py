from fastapi import APIRouter
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Annotated
from models import Affordability
from models import User
from auth import get_current_user
from starlette import status

#Calculating the maximum affordable price based on income, deposit, and multiplier
def calculate_max_affordable_price(income: float, deposit: float, multiplier: float, first_time_buyer: bool, shared_ownership: bool = False, share_percent: float = 100) -> float:
    adjusted_multiplier = multiplier + 0.5 if first_time_buyer else multiplier
    share = share_percent / 100 if shared_ownership else 1
    return (income * adjusted_multiplier + deposit) / share

#Calculating the stamp duty based on the price and first-time buyer status
def calculate_stamp_duty(price: float, first_time_buyer: bool) -> float:
    if first_time_buyer:
        if price <= 425000:
            return 0
        elif price <= 625000:
            return (price - 425000) * 0.05
    else:
        if price <= 250000:
            return 0
        elif price <= 925000:
            return (price - 250000) * 0.05
    return 0  # basic fallback

#Creating new router
router = APIRouter(
    prefix="/calc",
    tags=["calc"],
)

#Pydantic model for input data
class AffordabilityInput(BaseModel):
    income: float
    deposit: float
    multiplier: float
    first_time_buyer: bool
    shared_ownership: bool
    share_percent: float


#Database dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]




#Calculating affordability based on user input
@router.post("/calculate_affordability")
def calculate_affordability(data: AffordabilityInput,    db: db_dependency,
    user: User = Depends(get_current_user)):

    max_affordable_price = calculate_max_affordable_price(
        income=data.income,
        deposit=data.deposit,
        multiplier=data.multiplier,
        first_time_buyer=data.first_time_buyer,
        shared_ownership=data.shared_ownership,
        share_percent=data.share_percent
    )

    # Optionally estimate stamp duty for the max price
    estimated_stamp_duty = calculate_stamp_duty(max_affordable_price, data.first_time_buyer)

    save_affordability(data, db=db, user_id=user["user_id"]) 

    return {
        "max_affordable_price": round(max_affordable_price, 2),
        "estimated_stamp_duty": round(estimated_stamp_duty, 2)
    }

#Saving affordability data to the database
def save_affordability(
    data: AffordabilityInput,
    db: db_dependency,
    user_id: int
):
    #Calculating max affordable price
    max_price = calculate_max_affordable_price(
        income=data.income,
        deposit=data.deposit,
        multiplier=data.multiplier,
        first_time_buyer=data.first_time_buyer,
        shared_ownership=data.shared_ownership,
        share_percent=data.share_percent
    )

    #Check if an entry already exists for this user
    existing_entry = (
        db.query(Affordability)
        .filter(Affordability.user_id == user_id)
        .first()
    )

    #Updating the existing entry if it exists
    if existing_entry:
        existing_entry.income = data.income
        existing_entry.deposit = data.deposit
        existing_entry.first_time_buyer = data.first_time_buyer
        existing_entry.shared_ownership = data.shared_ownership
        existing_entry.share_percent = data.share_percent
        existing_entry.max_price = max_price
        db.commit()
        db.refresh(existing_entry)
        return {
            "message": "Affordability updated successfully.",
            "max_price": round(max_price, 2)
        }

    #If no entry exists, create a new one
    db_result = Affordability(
        user_id=user_id,
        income=data.income,
        deposit=data.deposit,
        first_time_buyer=data.first_time_buyer,
        shared_ownership=data.shared_ownership,
        share_percent=data.share_percent,
        max_price=max_price
    )

    db.add(db_result)
    db.commit()
    db.refresh(db_result)

    return {
        "message": "Affordability saved successfully.",
        "max_price": round(max_price, 2)
    }

#Endpoint to get the latest affordability data for the user
@router.get("/latest", response_model=float)
def get_latest_affordability(
    db: db_dependency,
    user: User = Depends(get_current_user)
):
    entry = (
        db.query(Affordability)
        .filter(Affordability.user_id == user["user_id"])
        .order_by(Affordability.id.desc())
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="No affordability data found.")
    return entry.max_price

