import asyncio
import csv
import io
import uuid
import json
import os
from fastapi import APIRouter, UploadFile, Form, Depends
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.db import SessionLocal, AirQuality
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


# Flexible date parser
def parse_date_safe(value: str):
    if not value:
        return None
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y", "%d/%m/%Y", "%d/%m/%y"]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    try:
        return dateparser.parse(value).date()
    except Exception:
        raise ValueError(f"Unrecognized date format: {value}")


# New helper: normalize any date/time string into a standard format
def normalize_date(value: str) -> str | None:
    try:
        dt = dateparser.parse(value, fuzzy=True)
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return None


@router.post("/upload-csv")
async def upload_csv(file: UploadFile, target_db: str = Form(...), db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "started",
        "progress": 0,
        "inserted": 0,
        "total": 0,
        "failed": 0,
        "created": datetime.utcnow().isoformat(),
    }

    contents = await file.read()
    rows = list(csv.DictReader(io.StringIO(contents.decode("utf-8"))))
    total = len(rows)
    jobs[job_id]["total"] = total

    async def process_job():
        jobs[job_id]["status"] = "validating headers"
        await asyncio.sleep(1)

        failed_rows = []
        batch_size = 500
        inserted = 0
        jobs[job_id]["status"] = "inserting"
        for i in range(0, total, batch_size):
            batch = rows[i : i + batch_size]
            objs = []
            for row in batch:
                try:
                    # DATE/TIME normalization pass
                    invalid = False
                    for _col, _val in list(row.items()):
                        if _val is None:
                            continue
                        _name = str(_col).lower()
                        if "date" in _name or "time" in _name:
                            _norm = normalize_date(str(_val))
                            if _norm is None:
                                invalid = True
                                break
                            row[_col] = _norm
                    if invalid:
                        raise ValueError("Invalid date/time in row")

                    obj = AirQuality(
                        date_local=parse_date_safe(row["Date Local"]),
                        parameter_name=row["Parameter Name"],
                        arithmetic_mean=float(row["Arithmetic Mean"]),
                        local_site_name=row.get("Local Site Name"),
                        state_name=row.get("State Name"),
                        county_name=row.get("County Name"),
                        city_name=row.get("City Name"),
                        cbsa_name=row.get("CBSA Name"),
                    )
                    objs.append(obj)
                except Exception as e:
                    failed_rows.append({**row, "error": str(e)})
                    continue
            try:
                if objs:
                    db.add_all(objs)
                    db.commit()
            except SQLAlchemyError as e:
                db.rollback()
                jobs[job_id]["status"] = "error"
                jobs[job_id]["message"] = f"DB insert error: {str(e)}"
                return
            inserted += len(objs)
            jobs[job_id]["inserted"] = inserted
            jobs[job_id]["progress"] = int(inserted / total * 100)
            jobs[job_id]["failed"] = len(failed_rows)
            await asyncio.sleep(0)

        # Save failed rows to CSV if any
        if failed_rows:
            fail_path = os.path.join(FAILED_DIR, f"failed_rows_{job_id}.csv")
            with open(fail_path, "w", newline="", encoding="utf-8") as f:
                # Write job metadata as header comments
                f.write(f"# Job ID: {job_id}\n")
                f.write(f"# Status: {jobs[job_id]['status']}\n")
                f.write(f"# Inserted: {inserted} / {total}\n")
                f.write(f"# Failed: {len(failed_rows)}\n")
                f.write(f"# Created: {jobs[job_id]['created']}\n\n")
                writer = csv.DictWriter(f, fieldnames=list(failed_rows[0].keys()))
                writer.writeheader()
                writer.writerows(failed_rows)
            jobs[job_id]["message"] = f"{len(failed_rows)} rows failed. Download at /failed/{job_id}"

        jobs[job_id]["progress"] = 100
        jobs[job_id]["status"] = "complete"
        jobs[job_id]["finished"] = datetime.utcnow().isoformat()

    asyncio.create_task(process_job())
    return {"job_id": job_id}


@router.get("/upload-status/{job_id}")
async def upload_status(job_id: str):
    async def event_stream():
        while True:
            if job_id not in jobs:
                yield 'data: {"error": "Job not found"}\n\n'
                break
            job = jobs[job_id]
            data = {
                "status": job.get("status"),
                "progress": job.get("progress"),
                "inserted": job.get("inserted"),
                "total": job.get("total"),
                "failed": job.get("failed", 0),
                "created": job.get("created"),
                "finished": job.get("finished", None),
            }
            if "message" in job:
                data["message"] = job["message"]
            yield f"data: {json.dumps(data)}\n\n"
            if job["status"] in ("complete", "error"):
                break
            await asyncio.sleep(1)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# Endpoint to download failed rows CSV
@router.get("/failed/{job_id}")
async def get_failed(job_id: str):
    fail_path = os.path.join(FAILED_DIR, f"failed_rows_{job_id}.csv")
    if os.path.exists(fail_path):
        return FileResponse(fail_path, media_type="text/csv", filename=f"failed_rows_{job_id}.csv")
    return {"error": "No failed rows file found for this job"}
