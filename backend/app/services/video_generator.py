import time
import os
from google import genai 
from google.genai import types
from dotenv import load_dotenv, find_dotenv

# --- CONFIGURATION ---
load_dotenv(find_dotenv())
project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
bucket_path = os.getenv("BUCKET_PATH")

client = genai.Client(
    vertexai=True, 
    project=project_id, # <-- Put your Project ID here
    location="us-central1"
)

def wait_for_op(operation, uri):
    """Helper to poll the operation until finished."""
    print(f"Generation started... Target: {uri}")
    while not operation.done:
        time.sleep(15)
        operation = client.operations.get(operation)

    print("Video generation complete! Check your bucket now.")

    return operation

def base_veo_video(prompt_text, duration):
    """Generates a new video (4, 6, or 8s)."""
    # Create a unique path for every run
    timestamp = int(time.time())
    valid_dur = min([4, 6, 8], key=lambda x: abs(x - duration))
    full_uri = f"{bucket_path}/veo_video_{timestamp}.mp4"
    print(timestamp)
    """Generates a new video (4, 6, or 8s)."""
    operation = client.models.generate_videos(
        model="veo-3.1-generate-001",
        prompt=prompt_text,
        config=types.GenerateVideosConfig(
        aspect_ratio="9:16",
        duration_seconds=valid_dur,
        resolution="720p",
        output_gcs_uri=full_uri
        ),
    )
    finished_op = wait_for_op(operation, full_uri)
    return finished_op, full_uri # Return both!



def extend_veo_video(prompt_text, previous_op):
    """Extends existing video by 7s."""
    timestamp = int(time.time())
    full_uri = f"{bucket_path}/veo_video_{timestamp}.mp4"

    # Extract the Video object from the result
    prev_video_obj = previous_op.result.generated_videos[0].video
    print(f"➕ Extending video from previous video object")

    operation = client.models.generate_videos(
        model="veo-3.1-generate-001",
        prompt=f"Continue the scene: {prompt_text}",
        video=prev_video_obj, # Pass the object directly!
        config=types.GenerateVideosConfig(
            aspect_ratio="9:16",
            output_gcs_uri=full_uri
        ),
    )
    finished_op = wait_for_op(operation, full_uri)
    return finished_op, full_uri # Return both!


def gen_video(prompt_text, target_duration):
    """Decides whether to just generate or to generate + extend."""
    if target_duration <= 8:
        # Simple case: just one call
        final_op, final_uri = base_veo_video(prompt_text, target_duration)
        return final_uri
    else:
        # Complex case: generate 8s base, then loop extensions
        print(f"🚀 Long video requested ({target_duration}s). Running chain...")
        current_op, current_uri = base_veo_video(prompt_text, 8)
        current_len = 8
        
        while current_len < target_duration:
            current_op, current_uri = extend_veo_video(prompt_text, current_op)
            current_len += 7

        final_uri = current_uri

        print(f"✨ ALL DONE! Final video at: {final_uri}")
        return final_uri
    
def sign(input_uri):
    # Return the blob name for serving
    try:
        if input_uri.startswith("gs://"):
            valid_path = input_uri[5:]
        else:
            valid_path = input_uri
            
        parts = valid_path.split("/", 1)
        if len(parts) >= 2:
            return parts[1] # The blob name
        return None
        
    except Exception as e:
        print(f"Error parsing path: {e}")
        return None


# --- RUN IT ---
PROMPT = "5 icecream on the desk falling repeatly"
video_uri = gen_video(PROMPT, target_duration=6)
signed_uri = sign(video_uri)

print(signed_uri)