import time
import os
from google import genai 
from google.genai import types
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

PROMPT = """ 3 pigs eating corns """

generate_veo_video(PROMPT)