from fastapi import FastAPI
from backend.routes import forecast

app = FastAPI()
app.include_router(forecast.router, prefix="/forecast")
