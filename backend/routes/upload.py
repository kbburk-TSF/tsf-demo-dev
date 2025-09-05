import os
import csv
import io
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from dateutil import parser

# Define the router — this is what main.py expects
router = APIRouter()
# Alias for backward compatibility (if older code imported "jobs")
jobs = router

FAILED_DIR = "data/failed_uploads"
os.makedirs(FAILED_DIR, exist_ok=True)

EXPECTED_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"  # Adjust for your schema

def normalize_date(value: str) -> str | None:
    try:
        dt = parser.parse(value, fuzzy=True)
        return dt.strftime(EXPECTED_DATE_FORMAT)
    except Exception:
        return None

@router.post("/upload")
async def upload_csv(dataset: str = Form(...), file: UploadFile = None):
    if not file:
        return JSONResponse({"error": "No file uploaded"}, status_code=400)

    success_rows = []
    failed_rows = []

    content = await file.read()
    content_str = content.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content_str))

    for row in reader:
        row_copy = row.copy()
        for key in row.keys():
            if "date" in key.lower() or "time" in key.lower():
                normalized = normalize_date(row[key])
                if normalized:
                    row_copy[key] = normalized
                else:
                    failed_rows.append(row)
                    break
        else:
            success_rows.append(row_copy)

    failed_file_url = None
    if failed_rows:
        failed_path = os.path.join(FAILED_DIR, f"failed_{file.filename}")
        with open(failed_path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=reader.fieldnames)
            writer.writeheader()
            writer.writerows(failed_rows)
        failed_file_url = f"/download_failed/{os.path.basename(failed_path)}"

    return {
        "success": len(success_rows),
        "failed": len(failed_rows),
        "failedFile": failed_file_url,
    }

@router.get("/download_failed/{filename}")
async def download_failed(filename: str):
    path = os.path.join(FAILED_DIR, filename)
    if os.path.exists(path):
        return FileResponse(path, filename=filename)
    return JSONResponse({"error": "File not found"}, status_code=404)
