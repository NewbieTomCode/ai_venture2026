from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from google.cloud import storage
import os
from dotenv import load_dotenv, find_dotenv

router = APIRouter(prefix="/media")

@router.get("/video/{blob_name:path}")
async def get_video(blob_name: str):
    load_dotenv(find_dotenv())
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    bucket_path = os.getenv("BUCKET_PATH")
    
    if not bucket_path:
        raise HTTPException(status_code=500, detail="Bucket configuration missing")

    try:
        storage_client = storage.Client(project=project_id)
        
        # Determine correct full bucket name
        # If BUCKET_PATH is gs://my-bucket/videos, we need to handle that.
        # But earlier logic assumed full_uri = bucket_path + /filename
        # So bucket_path likely includes the bucket name.
        
        if bucket_path.startswith("gs://"):
            path_parts = bucket_path[5:].split("/", 1)
            bucket_name = path_parts[0] 
        else:
            bucket_name = bucket_path.split("/")[0]

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        if not blob.exists():
            raise HTTPException(status_code=404, detail="Video not found")

        def iterfile():
            with blob.open("rb") as f:
                while chunk := f.read(1024 * 1024):  # 1MB chunks
                    yield chunk

        return StreamingResponse(
            iterfile(), 
            media_type="video/mp4"
        )
            
    except Exception as e:
        print(f"Error streaming video: {e}")
        raise HTTPException(status_code=500, detail=str(e))
