import uuid
import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .preprocessing import remove_background
from .model_generation import generate_3d_model
from .langgraph_agent import tag_asset

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
PROCESSED_DIR = BASE_DIR / "processed"
MODELS_DIR = BASE_DIR / "models"

for d in (UPLOAD_DIR, PROCESSED_DIR, MODELS_DIR):
    d.mkdir(exist_ok=True)

app = FastAPI(title="OmniMesh API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/models", StaticFiles(directory=str(MODELS_DIR)), name="models")
app.mount("/processed", StaticFiles(directory=str(PROCESSED_DIR)), name="processed")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/generate-3d")
async def generate_3d(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are supported.")

    job_id = uuid.uuid4().hex[:12]
    ext = Path(file.filename).suffix if file.filename else ".png"
    raw_path = UPLOAD_DIR / f"{job_id}{ext}"
    cleaned_path = PROCESSED_DIR / f"{job_id}_clean{ext}"
    model_path = MODELS_DIR / f"{job_id}.obj"

    content = await file.read()
    raw_path.write_bytes(content)

    remove_background(str(raw_path), str(cleaned_path))
    os.remove(raw_path)

    tags = tag_asset(file.filename or "unknown", cleaned_path.name)

    generate_3d_model(str(cleaned_path), str(model_path))

    return {
        "job_id": job_id,
        "model_url": f"/models/{model_path.name}",
        "processed_image_url": f"/processed/{cleaned_path.name}",
        "tags": tags,
    }
