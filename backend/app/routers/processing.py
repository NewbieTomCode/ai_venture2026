from fastapi import APIRouter, UploadFile, File
from app.services.ocr import extract_paragraphs
from app.services.trailer_prompt import generate_trailer_prompt # Singular function name
import shutil
import os

from app.services.video_generator import generate_video

router = APIRouter(prefix="/processing")

@router.post("/generate-trailer")
async def handle_request(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    
    # 1. Save locally
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 2. Call the OCR service
        raw_text = extract_paragraphs(temp_path)

        # 3. Call the Director service
        # Updated: Now returns a single TrailerScene object instead of a list
        scene_data = generate_trailer_prompt(raw_text)

        # 4. Generate the Video using Veo (extended 30s version)
        print(f"Generating extended video for prompt: {scene_data.video_prompt}")
        video_blob = generate_video(scene_data, 30)

        return {
            "scene": scene_data,
            "video_blob": video_blob
        }
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)