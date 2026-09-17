"""
AI Gym & Fitness Assistant - Backend Entry Point

Run locally with:
    uvicorn main:app --reload

Then open http://127.0.0.1:8000/docs for the interactive Swagger UI where
you can test every module's endpoints directly.

On startup this also:
- creates the SQLite database (fitness.db) and all tables if missing
- starts the optional MQTT listener for the Smart Gym module, if
  paho-mqtt is installed and MQTT_BROKER_HOST is configured
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import init_db
from modules import (
    workout_trainer,
    diet_coach,
    smart_gym,
    habit_tracker,
    chat_companion,
    performance_analyzer,
    gym_recommender,
    analytics,
)

app = FastAPI(
    title="AI Gym & Fitness Assistant API",
    description="Unified backend for workout detection, diet planning, IoT smart gym, "
                "habit tracking, chat companion, performance scoring, gym recommendations, "
                "and analytics.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your deployed frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded workout images (stand-in for AWS S3 / Firebase storage)
UPLOAD_ROOT = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_ROOT, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")

# Register each module's routes
app.include_router(workout_trainer.router)
app.include_router(diet_coach.router)
app.include_router(smart_gym.router)
app.include_router(habit_tracker.router)
app.include_router(chat_companion.router)
app.include_router(performance_analyzer.router)
app.include_router(gym_recommender.router)
app.include_router(analytics.router)


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    smart_gym.start_mqtt_listener()
    yield
    # Shutdown (optional cleanup here)

app = FastAPI(
    title="AI Gym & Fitness Assistant API",
    description="Unified backend for workout detection, diet planning, behavior "
                "tracking, IoT gym assistance, and conversational AI.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/")
def root():
    return {"message": "AI Gym & Fitness Assistant API is running. Visit /docs for API docs."}
