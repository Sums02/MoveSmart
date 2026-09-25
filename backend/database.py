from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()  # Loads from .env automatically

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "movesmart")

URL_DATABASE = os.getenv("URL_DATABASE", "postgresql://user:pass@localhost:5432/movesmart")

#Creating a database if it doesn't exist
def create_database_if_not_exists():
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(f'CREATE DATABASE "{DB_NAME}";')
        print(f"✅ Database '{DB_NAME}' created.")
        cur.close()
        conn.close()
    except psycopg2.errors.DuplicateDatabase:
        print(f"Database '{DB_NAME}' already exists.")
    except Exception as e:
        print("Could not check or create database:", e)

create_database_if_not_exists()

#Connecting to the database
engine = create_engine(URL_DATABASE)
#Creating a session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#Creating a base class for declarative models
Base = declarative_base()

#Saving model data
df = pd.read_csv("data/final_data.csv")
la_df = pd.read_csv('data/unique_la_codes.csv')
listings_df = pd.read_csv('data/mock_listings.csv')

# Store everything to postgres
df.to_sql("forecast_data", engine, index=False, if_exists="replace")
la_df.to_sql('la_lookup', engine, if_exists='replace', index=False)
listings_df.to_sql('listings_data', engine, if_exists='replace', index=False)

