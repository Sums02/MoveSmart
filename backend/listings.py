from models import Listings
from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal

#Creating a new router
router = APIRouter(
    prefix="/listings",
    tags=["listings"]
)

#Database dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

#Fetching all properties from dummy database table
@router.get("/properties")
def get_properties(db: Session = Depends(get_db)):
    print("Fetching properties from database")
    listings = db.query(Listings).all()
    #Sanity check
    print(f"Found {len(listings)} listings")
    return [
        {
            "latitude": l.latitude,
            "longitude": l.longitude,
            "title": l.title,
            "price": l.price,
            "lister_url": l.lister_url
        }
        for l in listings
    ]