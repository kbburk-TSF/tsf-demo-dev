from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload

app = FastAPI()

# Allow your frontend to call the backend
origins = [
    "*"  # For testing — allows all origins
    # Later, restrict to: "https://your-frontend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
