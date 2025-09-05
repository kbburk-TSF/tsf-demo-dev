from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload
from backend.db import Base, engine, SessionLocal, AirQuality
from sqlalchemy import inspect

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create schema on startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Health check
@app.get("/health")
def health():
    db_ok = False
    schema_ok = False
    try:
        session = SessionLocal()
        session.execute("SELECT 1")
        db_ok = True

        inspector = inspect(engine)
        schema_ok = "air_quality" in inspector.get_table_names()
    except Exception:
        db_ok = False
    finally:
        session.close()

    return {
        "status": "ok",
        "database": "up" if db_ok else "down",
        "schema": "ready" if schema_ok else "missing",
    }

# Include routes
app.include_router(upload.router)
