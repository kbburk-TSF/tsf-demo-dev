import os, csv, uuid, asyncio, datetime
from fastapi import APIRouter, UploadFile, Form
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
    }

    async def process_file(job_id, file, target_db):
        session = SessionLocal()
        try:
            content = await file.read()
            lines = content.decode("utf-8").splitlines()
            reader = csv.DictReader(lines)

            total = len(lines) - 1
            jobs[job_id]["total"] = total

            inserted = 0
            failed = 0
            for idx, row in enumerate(reader, 1):
                try:
                    record = AirQuality(
                        date=parse_date_safe(row.get("date")),
                        pm25=parse_float_safe(row.get("pm25")),
                        pm10=parse_float_safe(row.get("pm10")),
                        o3=parse_float_safe(row.get("o3")),
                        no2=parse_float_safe(row.get("no2")),
                        so2=parse_float_safe(row.get("so2")),
                        co=parse_float_safe(row.get("co")),
                    )
                    session.add(record)
                    inserted += 1
                except Exception:
                    failed += 1
                    with open(os.path.join(FAILED_DIR, f"{job_id}.csv"), "a") as f:
                        writer = csv.DictWriter(f, fieldnames=row.keys())
                        if f.tell() == 0:
                            writer.writeheader()
                        writer.writerow(row)

                if idx % 100 == 0:
                    session.commit()

                jobs[job_id]["progress"] = round((idx / total) * 100, 2)
                jobs[job_id]["inserted"] = inserted
                jobs[job_id]["failed"] = failed

            session.commit()
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["message"] = "Upload completed successfully"
        except Exception as e:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["message"] = str(e)
        finally:
            session.close()

    asyncio.create_task(process_file(job_id, file, target_db))
    return {"job_id": job_id, "status": "started"}

@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id in jobs:
        return jobs[job_id]
    return {"error": "Job not found"}

@router.get("/jobs")
async def list_jobs():
    return jobs
