"""
Pydantic request/response models used across all modules.
Kept simple on purpose -- extend fields as your real ML models grow.
"""
from pydantic import BaseModel
from typing import List, Optional


# ---------- 1. AI Gym Trainer ----------
class WorkoutAnalyzeRequest(BaseModel):
    exercise: str
    reps_detected: int
    form_score: float  # 0-100, would come from MediaPipe/OpenPose in the real system


# ---------- 2. AI Dietician & Calorie Coach ----------
class DietPlanRequest(BaseModel):
    weight_kg: float
    height_cm: float
    age: int
    gender: str  # "male" or "female"
    goal: str  # "lose", "maintain", "gain"
    activity_level: str  # "sedentary", "light", "moderate", "active"


# ---------- 3. Smart Gym Assistant (AI + IoT) ----------
class SmartGymRequest(BaseModel):
    equipment_id: str
    current_load_kg: float
    reps_completed: int
    heart_rate: Optional[int] = None


# ---------- 4. AI Fitness Habit Tracker ----------
class HabitTrackRequest(BaseModel):
    last_7_days: List[bool]  # True = worked out that day


# ---------- 5. Virtual Gym Buddy (Chat) ----------
class ChatRequest(BaseModel):
    message: str


# ---------- 6. Pose-to-Performance Analyzer ----------
class PerformanceRequest(BaseModel):
    reps: int
    duration_minutes: float
    form_score: float  # 0-100


# ---------- 7. Gym Recommender & Planner ----------
class GymRecommendRequest(BaseModel):
    city: str
    goal: str  # "weight loss", "muscle gain", "general fitness"
