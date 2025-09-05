from sqlalchemy import Column, Integer, String, Date, Float
from backend.database import Base

class AirQuality(Base):
    __tablename__ = "air_quality"

    id = Column(Integer, primary_key=True, index=True)
    date_local = Column(Date, nullable=False)
    parameter_name = Column(String, nullable=False)
    arithmetic_mean = Column(Float, nullable=False)
    local_site_name = Column(String)
