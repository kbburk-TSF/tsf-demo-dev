from fastapi import FastAPI
from backend.routes import forecast

app = FastAPI()

from backend.routes import upload
app.include_router(upload.router, prefix="/api")
app.include_router(forecast.router, prefix="/forecast")


@app.get("/health")
def health():
    return {"status": "ok"}
