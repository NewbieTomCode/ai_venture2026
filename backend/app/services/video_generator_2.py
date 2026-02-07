import time
import os
import datetime
from google import genai 
from google.genai import types
from google.cloud import storage
from dotenv import load_dotenv, find_dotenv

def generate_veo_video(prompt_text):
    load_dotenv(find_dotenv())
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    bucket_path = os.getenv("BUCKET_PATH")

    client = genai.Client(
        vertexai=True, 
        project=project_id, # <-- Put your Project ID here
        location="us-central1"
    )

    # Create a unique path for every run
    timestamp = int(time.time())
    full_uri = f"{bucket_path}/veo_video_{timestamp}.mp4"
    print(timestamp)

    operation = client.models.generate_videos(
        model="veo-3.1-generate-001",
        prompt=prompt_text,
        config=types.GenerateVideosConfig(
        aspect_ratio="9:16",
        resolution="720p",
        output_gcs_uri=full_uri
        ),
    )

    print(f"Generation started... Target: {full_uri}")

    while not operation.done:
        time.sleep(10)
        operation = client.operations.get(operation)

    print("Video generation complete! Check your bucket now.")
    
    # Return the blob name for serving
    try:
        if full_uri.startswith("gs://"):
            valid_path = full_uri[5:]
        else:
            valid_path = full_uri
            
        parts = valid_path.split("/", 1)
        if len(parts) >= 2:
            return parts[1] # The blob name
        return None
        
    except Exception as e:
        print(f"Error parsing path: {e}")
        return None

PROMPT = """ 3 cows eating grass """

if __name__ == "__main__":
    result = generate_veo_video(PROMPT)
    print(f"Generated Blob Name: {result}")