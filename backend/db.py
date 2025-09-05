import os
import time
from sqlalchemy import Column, Integer, String, Float, Date, MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Normalize scheme: postgres:// -> postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Retry DB connection
engine = None
max_retries = 20
for attempt in range(max_retries):
    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
        conn = engine.connect()
        conn.close()
        break
    except Exception as e:
        if attempt == max_retries - 1:
            raise
        time.sleep(3)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base(metadata=MetaData(schema=None))

class AirQuality(Base):
    __tablename__ = "air_quality"

    id = Column(Integer, primary_key=True, index=True)
    date_local = Column(Date, nullable=False)
    parameter_name = Column(String, nullable=False)
    arithmetic_mean = Column(Float, nullable=False)
    local_site_name = Column(String)
    state_name = Column(String)
    county_name = Column(String)
    city_name = Column(String)
    cbsa_name = Column(String)
