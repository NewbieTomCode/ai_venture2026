import os
from google import genai
from google.genai import types
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# Initialize client (it will look for GEMINI_API_KEY environment variable)
client = genai.Client(api_key="YOUR_API_KEY_HERE")

# 1. Define the System Instruction (The "Director" persona)
system_instruction = """
You are a cinematic trailer director. Analyze the provided book text 
and generate a JSON shot list for a 30-second trailer.
Focus on visual metaphors, atmospheric lighting, and dramatic pacing.
"""

# 2. Define the exact JSON structure you need for your website logic
class TrailerScene(types.BaseModel):
    scene_number: int
    video_prompt: str
    voiceover_script: str
    mood: str

# 3. Call the model with the book text
response = client.models.generate_content(
    model="gemini-3-flash",
    contents="[PASTE YOUR BOOK TEXT HERE]",
    config=types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json", # Ensures valid JSON
        response_schema=list[TrailerScene]      # Forces the schema
    )
)

# 4. Access the generated JSON data
print(response.text)