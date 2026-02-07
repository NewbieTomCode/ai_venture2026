from fastapi import APIRouter, UploadFile, File
from services.ocr import extract_paragraphs
from services.trailer_prompt import generate_trailer_prompt # Singular function name
import shutil
import os

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

        return {"scene": scene_data}
        
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)