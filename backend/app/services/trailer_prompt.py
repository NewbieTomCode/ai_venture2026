import os
import json
from typing import List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# 1. Define the Schema (Single Scene)
class TrailerScene(BaseModel):
    video_prompt: str = Field(..., description="The 30-second visual evolution.")
    camera_choreography: str = Field(..., description="Continuous camera path.")
    audio_landscape: str = Field(..., description="Sound evolution cues.")
    voiceover_script: str = Field(..., description="Poetic script fragments.")
    visual_metaphor: str = Field(..., description="The symbolic anchor.")
    lighting_evolution: str = Field(..., description="How light shifts over 30s.")
    mood: str = Field(..., description="The emotional frequency.")

# 2. Main Service Function
def generate_trailer_prompt(book_text: str) -> TrailerScene:
    """
    Analyzes book text and returns a single, structured 30s trailer script.
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    system_instruction = """
    Role: You are a Master Cinematic Director and Veo Prompt Engineer specializing in "The Long Take." 
    Goal: Translate literary text into a single, seamless, 30-second continuous cinematic shot.
    
    Objectives:
    - Zero Cuts: Forbid "jump cuts." Use "transitional movements" and "visual metamorphosis."
    - Evoke, Don't Explain: Use symbolism and atmosphere (35mm grain, anamorphic flare).
    - Audio: Define a soundscape that evolves from ambient to a cinematic crescendo.
    """

    response = client.models.generate_content(
        model="gemini-2.0-flash", # Use the latest flash model
        contents=book_text,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=TrailerScene, # Single object, not a list!
        )
    )

    # Gemini 2.0 returns the parsed object directly if response_schema is provided
    return response.parsed

# Keep this for backward compatibility if needed, but the router uses the one above
def generate_trailer_prompts(book_text: str):
    return generate_trailer_prompt(book_text)