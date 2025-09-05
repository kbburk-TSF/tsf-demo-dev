import asyncio
import csv
import io
import uuid
from fastapi import APIRouter, UploadFile, Form, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.db import SessionLocal, AirQuality
from datetime import datetime

router = APIRouter()
jobs = {}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload-csv")
async def upload_csv(file: UploadFile, target_db: str = Form(...), db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "started", "progress": 0}

    contents = await file.read()
    rows = list(csv.DictReader(io.StringIO(contents.decode("utf-8"))))
    total = len(rows)

    async def process_job():
        jobs[job_id]["status"] = "running"
        batch_size = 500
        inserted = 0
        for i in range(0, total, batch_size):
            batch = rows[i:i+batch_size]
            objs = []
            for row in batch:
                try:
                    obj = AirQuality(
                        date_local=datetime.strptime(row["Date Local"], "%Y-%m-%d").date(),
                        parameter_name=row["Parameter Name"],
                        arithmetic_mean=float(row["Arithmetic Mean"]),
                        local_site_name=row.get("Local Site Name"),
                        state_name=row.get("State Name"),
                        county_name=row.get("County Name"),
                        city_name=row.get("City Name"),
                        cbsa_name=row.get("CBSA Name")
                    )
                    objs.append(obj)
                except Exception:
                    continue
            db.add_all(objs)
            db.commit()
            inserted += len(objs)
            jobs[job_id]["progress"] = int(inserted / total * 100)
            jobs[job_id]["status"] = "Inserting rows"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["status"] = "Upload complete!"

    asyncio.create_task(process_job())
    return {"job_id": job_id}

@router.get("/upload-status/{job_id}")
async def upload_status(job_id: str):
    async def event_stream():
        while True:
            if job_id not in jobs:
                yield "data: {\"error\": \"Job not found\"}\n\n"
                break
            status = jobs[job_id]["status"]
            progress = jobs[job_id]["progress"]
            yield f"data: {{\"progress\": {progress}, \"status\": \"{status}\"}}\n\n"
            if status == "Upload complete!":
                break
            await asyncio.sleep(1)
    return StreamingResponse(event_stream(), media_type="text/event-stream")
