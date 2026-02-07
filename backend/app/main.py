from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import processing, media

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev purposes, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(processing.router)
app.include_router(media.router)

@app.get("/")
async def root():
    return {"message": "Hello World!"}

