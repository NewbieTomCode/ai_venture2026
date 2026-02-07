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
    Role: You are a Master Cinematic Director and Veo Prompt Engineer specializing in "The Long Take." Your goal is to translate raw literary text into a single, seamless, 30-second continuous cinematic shot.
    Input: A parsed string containing plot points, character descriptions, and thematic elements from a book.
    
    Objectives:

    The Fluid Narrative: Instead of discrete shots, design a single continuous camera movement (e.g., a 30-second tracking shot or a complex crane-to-macro move) that evolves as it progresses.

    Visual Metamorphosis: Use the environment to show the "vibe" of the book. As the camera moves, the lighting or atmosphere should shift to reflect the emotional arc (e.g., starting in cold moonlight and ending in a fiery, flickering orange).

    Veo Audio Layering: Define a soundscape that evolves natively—starting with ambient silence and building into a rhythmic, cinematic crescendo.

    JSON Structure Requirements: Provide a single JSON object representing the Continuous Sequence:

    "overarching_visual_concept": A 2-sentence summary of the single-shot journey.

    "visual_evolution": A chronological description of how the scene changes (0s, 10s, 20s, 30s) without cutting.

    "camera_choreography": Precise instructions for a single, 30-second movement (e.g., "A slow, relentless forward dolly that starts at floor level and gradually rises to a high-angle overhead").

    "dynamic_audio_score": How the sound evolves from start to finish (e.g., "Starts with a low cello drone, layering in the sound of ticking clocks at 15s, ending with a sharp orchestral cutoff").

    "thematic_symbolism": The core metaphor used to represent the book without spoilers.

    Style Constraints:

    Zero Cuts: Explicitly forbid "jump cuts" or "scene changes." Use "transitional movements" instead.

    Cinematic Textures: 35mm film grain, anamorphic stretching, and heavy use of "atmosphere" (smoke, dust, rain).

    Non-Literal: Do not show the plot; show the weight of the plot through lighting and motion.
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

    print(response.parsed)

    # Gemini 2.0 returns the parsed object directly if response_schema is provided
    return response.parsed
