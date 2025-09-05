import os
import csv
import uuid
import asyncio
import datetime
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import AirQuality
from dateutil import parser as date_parser

router = APIRouter()

jobs = {}

FAILED_DIR = "failed_uploads"
os.makedirs(FAILED_DIR, exist_ok=True)

def parse_date_safe(value):
    if not value:
        return None
    try:
        return date_parser.parse(value, dayfirst=False, yearfirst=False).date()
    except Exception:
        return None

def parse_float_safe(value):
    try:
        return float(value)
    except Exception:
        return None

@router.post("/upload-csv")
async def upload_csv(file: UploadFile, target_db: str = Form(...)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "started",
        "progress": 0,
        "inserted": 0,
        "failed": 0,
        "total": 0,
        "message": "Upload started",
        "created": datetime.datetime.utcnow().isoformat(),
        "finished": None
    }

    # Save file locally
    tmp_path = f"temp_{job_id}.csv"
    with open(tmp_path, "wb") as buffer:
        buffer.write(await file.read())

    async def process_file():
        session: Session = SessionLocal()
        failed_rows = []
        total = 0
        inserted = 0
        failed = 0

        with open(tmp_path, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            # Normalize fieldnames
            field_map = {name.strip().lower(): name for name in reader.fieldnames}
            for row in reader:
                total += 1
                try:
                    date_val = parse_date_safe(row.get(field_map.get("date local", "Date Local")))
                    param = row.get(field_map.get("parameter name", "Parameter Name"))
                    mean_val = parse_float_safe(row.get(field_map.get("arithmetic mean", "Arithmetic Mean")))
                    site = row.get(field_map.get("local site name", "Local Site Name"))

                    if not (date_val and param and mean_val is not None):
                        raise ValueError("Missing or invalid required fields")

                    aq = AirQuality(
                        date_local=date_val,
                        parameter_name=param,
                        arithmetic_mean=mean_val,
                        local_site_name=site
                    )
                    session.add(aq)
                    inserted += 1
                except Exception as e:
                    failed += 1
                    row["error"] = str(e)
                    failed_rows.append(row)

                if total % 500 == 0:
                    session.commit()
                    jobs[job_id].update({
                        "status": "inserting",
                        "progress": int((total / max(1, len(reader.fieldnames))) * 100),
                        "inserted": inserted,
                        "failed": failed,
                        "total": total
                    })

        session.commit()
        session.close()

        # Save failed rows with metadata
        if failed_rows:
            failed_path = os.path.join(FAILED_DIR, f"failed_rows_{job_id}.csv")
            with open(failed_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=list(failed_rows[0].keys()))
                f.write(f"# Job ID: {job_id}\n")
                f.write(f"# Status: complete\n")
                f.write(f"# Inserted: {inserted}/{total}\n")
                f.write(f"# Failed: {failed}\n")
                f.write(f"# Created: {jobs[job_id]['created']}\n")
                writer.writeheader()
                writer.writerows(failed_rows)

        jobs[job_id].update({
            "status": "complete",
            "progress": 100,
            "inserted": inserted,
            "failed": failed,
            "total": total,
            "message": f"{failed} rows failed. Download at /failed/{job_id}" if failed else "All rows inserted",
            "finished": datetime.datetime.utcnow().isoformat()
        })
        os.remove(tmp_path)

    asyncio.create_task(process_file())
    return {"job_id": job_id}

@router.get("/upload-status/{job_id}")
async def upload_status(job_id: str):
    return jobs.get(job_id, {"status": "unknown job"})

@router.get("/jobs")
async def list_jobs():
    return jobs

@router.get("/failed/{job_id}")
async def get_failed(job_id: str):
    failed_path = os.path.join(FAILED_DIR, f"failed_rows_{job_id}.csv")
    if os.path.exists(failed_path):
        return FileResponse(failed_path, filename=f"failed_rows_{job_id}.csv")
    return {"error": "No failed rows file found"}
