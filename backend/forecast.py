
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import LALookup
import pandas as pd

#Creating a new router
router = APIRouter(
    prefix="/forecast",
    tags=["forecast"]
)

#Database dependencies
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

#Matching Location name to LAcode
@router.get("/get-lacode")
def get_lacode(la_name: str, db: Session = Depends(get_db)):
    la_entry = db.query(LALookup).filter(LALookup.LA.ilike(f"{la_name}")).first()

    if not la_entry:
        raise HTTPException(status_code=404, detail="LA not found")

    return {"LAcode": la_entry.LAcode}

#Fetching median price data
@router.get("/get-forecast")
def get_forecast(lacode: int, db: Session = Depends(get_db)):
    query = f"""
    SELECT "Date", "median"
    FROM forecast_data
    WHERE "LAcode" = {lacode}
    ORDER BY "Date"
    """

    df = pd.read_sql(query, db.bind)
    return df.to_dict(orient="records")
