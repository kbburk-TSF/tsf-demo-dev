import asyncio
import csv
import io
import uuid
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import StreamingResponse

router = APIRouter()

jobs = {}

@router.post("/upload-csv")
async def upload_csv(file: UploadFile, target_db: str = Form(...)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "started"}

    # Read file fully into memory once
    contents = await file.read()
    rows = list(csv.reader(io.StringIO(contents.decode("utf-8"))))

    async def process_job():
        jobs[job_id]["status"] = "running"
        for i, row in enumerate(rows):
            await asyncio.sleep(0.5)  # simulate insert delay
            jobs[job_id]["status"] = f"Processed row {i+1}/{len(rows)}"
        jobs[job_id]["status"] = "Upload complete!"

    asyncio.create_task(process_job())
    return {"job_id": job_id}

@router.get("/upload-status/{job_id}")
async def upload_status(job_id: str):
    async def event_stream():
        while True:
            if job_id not in jobs:
                yield "data: Job not found\n\n"
                break
            status = jobs[job_id]["status"]
            yield f"data: {status}\n\n"
            if status == "Upload complete!":
                break
            await asyncio.sleep(1)
    return StreamingResponse(event_stream(), media_type="text/event-stream")
