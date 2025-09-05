import os
import csv
import io
import uuid
import json
import asyncio
from fastapi import APIRouter, UploadFile, Form, Depends
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db import SessionLocal, AirQuality  # ✅ reverted to stable import
from datetime import datetime
from dateutil import parser as dateparser


router = APIRouter()
jobs = {}

FAILED_DIR = "failed_uploads"
os.makedirs(FAILED_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_date(value: str) -> str | None:
    """Parse any date string into schema format (YYYY-MM-DD HH:MM:SS)."""
    try:
        dt = dateparser.parse(value, fuzzy=True)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return None


async def process_csv(job_id: str, dataset: str, file: UploadFile, db: Session):
    try:
        content = await file.read()
        content_str = content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(content_str))

        success_rows = []
        failed_rows = []

        for row in reader:
            row_data = {}
            valid = True
            for column, value in row.items():
                if value:
                    # Normalize date/time columns
                    if "date" in column.lower() or "time" in column.lower():
                        normalized = normalize_date(value)
                        if normalized:
                            row_data[column] = normalized
                        else:
                            failed_rows.append(row)
                            valid = False
                            break
                    else:
                        row_data[column] = value
                else:
                    row_data[column] = None
            if valid:
                success_rows.append(row_data)

        # Insert rows into DB based on dataset
        inserted_count = 0
        if dataset == "AirQuality":
            for row in success_rows:
                try:
                    record = AirQuality(**row)
                    db.add(record)
                    inserted_count += 1
                except Exception as e:
                    failed_rows.append(row)
            db.commit()
        elif dataset == "Health":
            for row in success_rows:
                try:
                    record = Health(**row)
                    db.add(record)
                    inserted_count += 1
                except Exception as e:
                    failed_rows.append(row)
            db.commit()
        elif dataset == "Jobs":
            for row in success_rows:
                try:
                    record = Jobs(**row)
                    db.add(record)
                    inserted_count += 1
                except Exception as e:
                    failed_rows.append(row)
            db.commit()

        # Save failed rows if any
        failed_file_url = None
        if failed_rows:
            fail_path = os.path.join(FAILED_DIR, f"{job_id}_failed.csv")
            with open(fail_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
                writer.writeheader()
                writer.writerows(failed_rows)
            failed_file_url = f"/download_failed/{job_id}"

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["success"] = inserted_count
        jobs[job_id]["failed"] = len(failed_rows)
        jobs[job_id]["failedFile"] = failed_file_url

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@router.post("/upload")
async def upload_csv(
    dataset: str = Form(...),
    file: UploadFile = None,
    db: Session = Depends(get_db),
):
    if not file:
        return JSONResponse({"error": "No file uploaded"}, status_code=400)

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing", "success": 0, "failed": 0}

    asyncio.create_task(process_csv(job_id, dataset, file, db))

    return {"job_id": job_id, "status": "processing"}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}
    return job


@router.get("/download_failed/{job_id}")
async def download_failed(job_id: str):
    fail_path = os.path.join(FAILED_DIR, f"{job_id}_failed.csv")
    if os.path.exists(fail_path):
        return FileResponse(
            fail_path,
            media_type="text/csv",
            filename=f"failed_rows_{job_id}.csv",
        )
    return {"error": "No failed rows file found for this job"}
