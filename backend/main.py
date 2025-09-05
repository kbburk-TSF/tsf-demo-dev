from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload
from backend.db import Base, engine, SessionLocal, AirQuality
from sqlalchemy import inspect, func
from datetime import datetime

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

# Health check with detailed errors
@app.get("/health")
def health():
    db_ok = False
    schema_ok = False
    row_count = None
    error_msg = None
    try:
        session = SessionLocal()
        session.execute("SELECT 1")
        db_ok = True

        inspector = inspect(engine)
        schema_ok = "air_quality" in inspector.get_table_names()

        if schema_ok:
            row_count = session.query(AirQuality).count()
    except Exception as e:
        error_msg = str(e)
        db_ok = False
    finally:
        try:
            session.close()
        except:
            pass

    result = {
        "status": "ok",
        "database": "up" if db_ok else "down",
        "schema": "ready" if schema_ok else "missing",
        "rows": row_count
    }
    if error_msg:
        result["error"] = error_msg
    return result

# Row count shortcut
@app.get("/rowcount")
def rowcount():
    session = SessionLocal()
    try:
        total = session.query(AirQuality).count()
        return {"rows": total}
    finally:
        session.close()

# Stats endpoint
@app.get("/stats")
def stats():
    session = SessionLocal()
    try:
        total = session.query(AirQuality).count()
        earliest = session.query(func.min(AirQuality.date_local)).scalar()
        latest = session.query(func.max(AirQuality.date_local)).scalar()
        last_updated = datetime.utcnow().isoformat()
        return {
            "air_quality": {
                "rows": total,
                "earliest_date": str(earliest) if earliest else None,
                "latest_date": str(latest) if latest else None,
                "last_updated": last_updated
            }
        }
    finally:
        session.close()

# Jobs endpoint (reads from upload.jobs)
from backend.routes.upload import jobs

@app.get("/jobs")
def list_jobs():
    return jobs

# Include routes
app.include_router(upload.router)
