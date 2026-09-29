"""
Module 1: AI Gym Trainer (Workout Detection & Feedback System)
"""
import os
import uuid
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from db_models import WorkoutLog
from models.schemas import WorkoutAnalyzeRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workout", tags=["AI Gym Trainer"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "workout")
os.makedirs(UPLOAD_DIR, exist_ok=True)

try:
    import cv2
    import mediapipe as mp
    import numpy as np
    POSE_AVAILABLE = True
    mp_pose = mp.solutions.pose
except ImportError:
    POSE_AVAILABLE = False


def generate_feedback(exercise: str, reps: int, form_score: float) -> str:
    if form_score >= 85:
        quality = "Excellent form!"
    elif form_score >= 60:
        quality = "Decent form, but watch your posture."
    else:
        quality = "Form needs work — slow down and focus on technique."
    return f"{exercise.title()}: {reps} reps detected. {quality}"


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle


@router.post("/analyze")
def analyze_workout(payload: WorkoutAnalyzeRequest, db: Session = Depends(get_db)):
    try:
        feedback = generate_feedback(payload.exercise, payload.reps_detected, payload.form_score)

        log = WorkoutLog(
            exercise=payload.exercise,
            reps_detected=payload.reps_detected,
            form_score=payload.form_score,
            feedback=feedback,
        )
        db.add(log)
        db.commit()

        return {
            "exercise": payload.exercise,
            "reps_detected": payload.reps_detected,
            "form_score": payload.form_score,
            "feedback": feedback,
        }
    except Exception as e:
        db.rollback()
        logger.exception("workout/analyze failed")
        raise HTTPException(status_code=500, detail=f"Could not save workout log: {str(e)}")


@router.post("/analyze-image")
async def analyze_image(exercise: str = "squat", file: UploadFile = File(...), db: Session =