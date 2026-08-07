"""
Module 1: AI Gym Trainer (Workout Detection & Feedback System)

Two modes:
1. /workout/analyze       -- rule-based feedback from a rep count + form
   score you already have (e.g. from a wearable, manual entry, or your own
   pipeline). Always available, zero extra dependencies.
2. /workout/analyze-image -- REAL pose detection using MediaPipe. Upload a
   single photo of someone mid-exercise; MediaPipe Pose detects body
   landmarks and a simple joint-angle rule estimates form quality.
   Requires: pip install mediapipe opencv-python-headless
   If those aren't installed, this endpoint returns a clear 501 error
   instead of crashing the whole app.

This keeps the basic endpoint dependency-free while giving you a real,
working computer-vision path to build on.
"""
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from db_models import WorkoutLog
from models.schemas import WorkoutAnalyzeRequest

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
    """Angle (degrees) at point b, formed by points a-b-c. Used for a very
    simple knee/elbow bend check from MediaPipe landmarks."""
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle


@router.post("/analyze")
def analyze_workout(payload: WorkoutAnalyzeRequest, db: Session = Depends(get_db)):
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


@router.post("/analyze-image")
async def analyze_image(exercise: str = "squat", file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Real pose-detection endpoint. Upload one image; returns detected
    landmarks and a rough knee-angle-based form score."""
    if not POSE_AVAILABLE:
        raise HTTPException(
            status_code=501,
            detail="Pose detection isn't installed. Run: pip install mediapipe opencv-python-headless",
        )

    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    image = cv2.imread(filepath)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not read the uploaded image.")

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    with mp_pose.Pose(static_image_mode=True) as pose:
        results = pose.process(image_rgb)

    if not results.pose_landmarks:
        return {"detected": False, "message": "No person/pose detected in the image."}

    lm = results.pose_landmarks.landmark
    hip = [lm[mp_pose.PoseLandmark.LEFT_HIP.value].x, lm[mp_pose.PoseLandmark.LEFT_HIP.value].y]
    knee = [lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x, lm[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
    ankle = [lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
    knee_angle = round(calculate_angle(hip, knee, ankle), 1)

    # Very simple heuristic: a squat near full depth has a smaller knee angle
    form_score = 90 if knee_angle < 100 else (70 if knee_angle < 140 else 45)
    feedback = generate_feedback(exercise, 1, form_score)

    log = WorkoutLog(exercise=exercise, reps_detected=1, form_score=form_score, feedback=feedback)
    db.add(log)
    db.commit()

    return {
        "detected": True,
        "knee_angle_degrees": knee_angle,
        "form_score": form_score,
        "feedback": feedback,
        "saved_image": filename,
    }


@router.get("/history")
def workout_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(WorkoutLog).order_by(WorkoutLog.created_at.desc()).limit(limit).all()
    return [
        {
            "exercise": r.exercise,
            "reps_detected": r.reps_detected,
            "form_score": r.form_score,
            "feedback": r.feedback,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
