import os
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
import json
from pydantic import BaseModel, Field
from typing import List

load_dotenv(find_dotenv())

class TrailerScene(BaseModel):
    video_prompt: str = Field(..., description="High-detail visual description including lighting, texture, and color palette.")
    camera_movement: str = Field(..., description="Cinematic instructions: e.g., 'Slow crane down,' 'Handheld shake,' or 'Dolly zoom'.")
    audio_landscape: str = Field(..., description="Audio cues for Veo: e.g., 'Low-frequency synth swell,' 'Sound of rain on tin,' or 'Distorted heartbeat'.")
    voiceover_script: str = Field(..., description="The lyrical text to be spoken, focusing on theme rather than plot.")
    visual_metaphor: str = Field(..., description="The underlying symbol being shown to avoid spoilers (e.g., 'A wilting rose representing lost hope').")
    mood: str = Field(..., description="The specific emotional frequency, e.g., 'Melancholic Longing' or 'Fractured Paranoia'.")
    duration_seconds: int = Field(default=5, ge=1, le=10, description="Duration of this specific shot.")

def generate_trailer_prompts(book_text: str):

    # Initialize client (it will look for GEMINI_API_KEY environment variable)
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    system_instruction = """
    **Role**: You are a Master Cinematic Director and Veo Prompt Engineer. Your goal is to translate raw literary text into a high-impact, emotionally resonant 30-second trailer script.

    **Input**: A parsed string containing plot points, character descriptions, and thematic elements from a book.

    **Objectives**:
    1. **Evoke, Don't Explain**: Use visual metaphors and atmospheric cues to convey the book's "vibe" (e.g., isolation, hope, dread) without spoiling key plot twists.
    2. **Veo-Specific Optimization**: Explicitly define camera dynamics (pans, dollies, tracking), lighting (chiaroscuro, golden hour, neon), and native audio cues (ambient hums, sharp whispers, swelling orchestral notes).
    3. **Pacing**: Structure the JSON as a 3-act progression: 
    - 0-10s: Hook/Atmosphere.
    - 10-25s: Rising Tension/Emotional Core.
    - 25-30s: The "Stinger" (Final iconic image + Title card cue).

    **JSON Structure Requirements**:
    For each shot, provide:
    - "timestamp": (e.g., 00:00 - 00:05)
    - "visual_prompt": Detailed descriptive text for Veo.
    - "motion_control": Specific camera movement instructions.
    - "audio_cue": Sound design instructions for Veo native audio generation.
    - "emotional_intent": The specific feeling this shot should elicit.

    **Style Constraints**:
    - No talking heads or "literal" exposition.
    - Focus on "Cinematic textures": 35mm film grain, anamorphic flare, macro close-ups.
    - Avoid spoilers; focus on the *symbolism* of the protagonist's journey.
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=book_text,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json", # Ensures valid JSON
            response_schema=list[TrailerScene],      # Forces the schema
            safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_ONLY_HIGH" 
            )
        ]
        )
    )

    return response.parsed