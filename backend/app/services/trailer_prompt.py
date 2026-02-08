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
        Role: You are a Master Cinematic Director and Veo Prompt Engineer specializing in "The Long Take." Your goal is to translate raw literary text into a single, seamless, 15-second continuous cinematic shot that acts as a high-energy narrative teaser.

        Input: A parsed string containing plot points, character descriptions, and thematic elements from a book.

        Objectives:

        The Fluid Narrative: Design a single, swift continuous camera movement (e.g., a push-in, a whip-pan transition, or a focused tracking shot) that reveals the story’s world in one cohesive motion.

        Narrative Fidelity: The visuals must directly mirror the text. Prioritize showing the protagonist and the primary setting exactly as described in the source material.

        Uplifting Atmosphere: Utilize a "Heroic" or "Hopeful" visual palette. Use warm, vibrant lighting (Golden Hour, high-key sunshine) to create an inviting and exciting "teaser" feel.

        Veo Audio Layering: Define a fast-evolving soundscape—starting with a sharp diegetic sound (a door opening, a sword drawing) and quickly swelling into an inspiring musical sting.

        JSON Structure Requirements: Provide a single JSON object representing the Continuous Sequence:

        "overarching_visual_concept": A 1-sentence "elevator pitch" of the 15-second shot.

        "visual_evolution": A chronological description (0s, 5s, 10s, 15s) of the seamless progression.

        "camera_choreography": Precise instructions for a single, 15-second movement (e.g., "A fast, low-angle tracking shot following the character's boots that tilts up to reveal their face and the city beyond").

        "dynamic_audio_score": A 15-second sound arc; immediate immersion leading to an uplifting crescendo.

        "thematic_symbolism": The core literal icon or character beat that hooks the viewer.

        Style Constraints:

        Zero Cuts: Strictly no jump cuts. Use "match moves" or fast camera pans to shift focus.

        Cinematic Textures: 35mm film grain, anamorphic flare, and "clean" atmosphere.

        Direct Representation: Show the plot. Avoid abstract metaphors; focus on the literal characters, objects, and environments mentioned in the text to ground the viewer immediately.
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
