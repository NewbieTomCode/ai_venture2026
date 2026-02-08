import time
import os
from google import genai 
from google.genai import types
from dotenv import load_dotenv, find_dotenv
from app.services.trailer_prompt import TrailerScene



from google.cloud import storage

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

    print(f"Operation details: {operation}")
    print("Video generation complete! Check your bucket now.")
    
    if operation.error:
        print(f"Operation failed with error: {operation.error}")
        raise RuntimeError(f"Video generation failed: {operation.error}")

    return operation

def base_veo_video(prompt_text, duration):
    """Generates a new video (4, 6, or 8s)."""
    # Create a unique path for every run
    timestamp = int(time.time())
    valid_dur = min([4, 6, 8], key=lambda x: abs(x - duration))
    # Use generated-videos subdirectory
    full_uri = f"{bucket_path}/generated-videos/veo_video_{timestamp}.mp4"
    print(timestamp)
    
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
    # Use generated-videos subdirectory
    full_uri = f"{bucket_path}/generated-videos/veo_video_{timestamp}.mp4"

    # Extract the Video object from the result
    if not previous_op.result or not previous_op.result.generated_videos:
        raise ValueError("Previous video generation failed or returned no videos.")
        
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
            # Update loop variable to break eventually for testing if needed, 
            # though logic implies we keep extending until >= target
            if current_len >= target_duration:
                break

        final_uri = current_uri

        print(f"✨ ALL DONE! Final video at: {final_uri}")
        return final_uri
    
def resolve_blob_name(input_uri):
    # Return the correct blob name for serving by finding the actual MP4 file
    try:
        if input_uri.startswith("gs://"):
            valid_path = input_uri[5:]
        else:
            valid_path = input_uri
            
        parts = valid_path.split("/", 1)
        if len(parts) < 2:
            return None
            
        bucket_name = parts[0]
        prefix = parts[1] # e.g. "generated-videos/veo_video_{timestamp}.mp4"
        
        storage_client = storage.Client(project=project_id)
        bucket = storage_client.bucket(bucket_name)
        
        # Veo creates a folder structure: prefix/request_id/sample_0.mp4
        # We need to find the actual .mp4 file.
        blobs = list(bucket.list_blobs(prefix=prefix))
        
        for blob in blobs:
            if blob.name.endswith(".mp4"):
                print(f"Found generated video: {blob.name}")
                return blob.name
                
        print(f"No MP4 file found under prefix: {prefix}")
        return None
        
    except Exception as e:
        print(f"Error resolving video path: {e}")
        return None
    
def get_input(scene_data: TrailerScene):
    # something will become prompt
    # something will become duration
    input_text = scene_data.video_prompt 
    system_prompt = f"""Camera Choreography: {scene_data.camera_choreography}; 
                        Audio Landscape: {scene_data.audio_landscape};
                        Voiceover Script: {scene_data.voiceover_script};
                        Lighting Evolution: {scene_data.lighting_evolution}; 
                        Mood: {scene_data.mood}"""
    prompt = f"User Prompt: {input_text}; System/Style Prompt: {system_prompt}"
    return prompt

def generate_video(scene_data: TrailerScene, duration: int):
    prompt = get_input(scene_data)
    video_uri = gen_video(prompt, duration)
    signed_uri = resolve_blob_name(video_uri)
    return signed_uri
