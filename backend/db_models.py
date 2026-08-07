"""
SQLAlchemy ORM models -- one table per module, so every result the app
generates is persisted and can be queried later for history/analytics.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base


class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    id = Column(Integer, primary_key=True, index=True)
    exercise = Column(String, nullable=False)
    reps_detected = Column(Integer, nullable=False)
    form_score = Column(Float, nullable=False)
    feedback = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DietLog(Base):
    __tablename__ = "diet_logs"
    id = Column(Integer, primary_key=True, index=True)
    bmi = Column(Float, nullable=False)
    maintenance_calories = Column(Integer, nullable=False)
    target_calories = Column(Integer, nullable=False)
    goal = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class HabitLog(Base):
    __tablename__ = "habit_logs"
    id = Column(Integer, primary_key=True, index=True)
    workouts_last_7_days = Column(Integer, nullable=False)
    skip_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=False)
    sentiment = Column(String, nullable=False)
    reply = Column(String, nullable=False)
    source = Column(String, default="rule-based")  # "rule-based" or "llm"
    created_at = Column(DateTime, default=datetime.utcnow)


class PerformanceLog(Base):
    __tablename__ = "performance_logs"
    id = Column(Integer, primary_key=True, index=True)
    performance_score = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    duration_minutes = Column(Float, nullable=False)
    form_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class GymRecommendationLog(Base):
    __tablename__ = "gym_recommendation_logs"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    source = Column(String, default="mock")  # "mock" or "google_places"
    created_at = Column(DateTime, default=datetime.utcnow)
