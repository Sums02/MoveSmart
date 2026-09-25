from sqlalchemy import Column, Integer, String,  Float
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey

#To store login credentials and user data
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)

    affordability_entries = relationship("Affordability", back_populates="user")

#Lookup table to map LAcodes to local authority and region names
class LALookup(Base):
    __tablename__ = 'la_lookup'

    LAcode = Column(Integer, primary_key=True, index=True)
    LA = Column(String, nullable=False)

#To store property listings data
class Listings(Base):
    __tablename__ = 'listings_data'

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    title = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    lister_url = Column(String, nullable=False)

#To store affordability data
class Affordability(Base):
    __tablename__ = "affordability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer)
    income = Column(Float, nullable=False)
    deposit = Column(Float, nullable=False)
    first_time_buyer = Column(String, nullable=False, default=False)  
    shared_ownership = Column(String, nullable=False, default=False)  
    share_percent = Column(Float, default=100.0)
    max_price = Column(Float, nullable=True)

    user = relationship("User", back_populates="affordability_entries")
