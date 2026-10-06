"""
Pydantic request/response models used across all modules.
Kept simple on purpose -- extend fields as your real ML models grow.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


# ---------- 1. AI Gym Trainer ----------

class WorkoutAnalyzeRequest(BaseModel):
    exercise: str = Field(
        min_length=2,
        max_length=50
    )

    reps_detected: int = Field(
        ge=0,
        le=1000
    )

    form_score: float = Field(
        ge=0,
        le=100
    )


# ---------- 2. AI Dietician ----------

class DietPlanRequest(BaseModel):
    weight_kg: float = Field(
        gt=0,
        le=500
    )

    height_cm: float = Field(
        gt=50,
        le=250
    )

    age: int = Field(
        ge=13,
        le=100
    )

    gender: str = Field(
        min_length=1
    )

    goal: str = Field(
        min_length=1
    )

    activity_level: str = Field(
        min_length=1
    )


# ---------- 3. Smart Gym ----------

class SmartGymRequest(BaseModel):
    equipment_id: str = Field(
        min_length=1,
        max_length=100
    )

    current_load_kg: float = Field(
        ge=0,
        le=1000
    )

    reps_completed: int = Field(
        ge=0,
        le=10000
    )

    heart_rate: Optional[int] = Field(
        default=None,
        ge=30,
        le=250
    )


# ---------- 4. Habit Tracker ----------

class HabitTrackRequest(BaseModel):
    last_7_days: List[bool] = Field(
        min_length=7,
        max_length=7
    )


# ---------- 5. Chat ----------

class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000
    )


# ---------- 6. Performance ----------

class PerformanceRequest(BaseModel):
    reps: int = Field(
        ge=0,
        le=10000
    )

    duration_minutes: float = Field(
        gt=0,
        le=1440
    )

    form_score: float = Field(
        ge=0,
        le=100
    )


# ---------- 7. Gym Recommender ----------

class GymRecommendRequest(BaseModel):
    city: str = Field(
        min_length=2,
        max_length=100
    )

    goal: str = Field(
        min_length=2,
        max_length=100
    )