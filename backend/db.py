from sqlalchemy import Column, Integer, String, Float, Date, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)
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
