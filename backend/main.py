from fastapi import FastAPI
from backend.routes import upload, forecast
from backend.database import Base, engine
from sqlalchemy import text

app = FastAPI()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(upload.router)
app.include_router(forecast.router)

@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "up"
    except Exception as e:
        return {"status": "ok", "database": "down", "error": str(e)}
    return {"status": "ok", "database": db_status}
