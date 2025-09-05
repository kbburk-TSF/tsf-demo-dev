import uuid
import csv
import asyncio
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import StreamingResponse

router = APIRouter()

# In-memory job tracking (could be replaced by Redis/db in production)
jobs = {}

async def process_csv(job_id: str, file: UploadFile, target_db: str):
    jobs[job_id] = ["Upload started"]
    await asyncio.sleep(0.5)

    try:
        content = await file.read()
        lines = content.decode("utf-8").splitlines()
        reader = csv.reader(lines)
        headers = next(reader)
        jobs[job_id].append(f"Validating headers: {headers}")

        row_count = len(lines) - 1
        for idx, row in enumerate(reader, start=1):
            # Simulate DB insert delay
            await asyncio.sleep(0.01)
            if idx % 50 == 0:
                jobs[job_id].append(f"Processed {idx}/{row_count} rows")

        jobs[job_id].append("Upload complete!")
    except Exception as e:
        jobs[job_id].append(f"Error: {str(e)}")


@router.post("/upload-csv")
async def upload_csv(file: UploadFile, target_db: str = Form(...)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = []
    asyncio.create_task(process_csv(job_id, file, target_db))
    return {"job_id": job_id}


@router.get("/upload-status/{job_id}")
async def upload_status(job_id: str):
    async def event_stream():
        last_index = 0
        while True:
            await asyncio.sleep(1)
            if job_id in jobs:
                updates = jobs[job_id][last_index:]
                for msg in updates:
                    yield f"data: {msg}\n\n"
                last_index = len(jobs[job_id])
                if updates and "Upload complete!" in updates[-1]:
                    break
            else:
                yield "data: Invalid job_id\n\n"
                break
    return StreamingResponse(event_stream(), media_type="text/event-stream")
