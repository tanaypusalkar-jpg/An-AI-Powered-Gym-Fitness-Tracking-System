"""
Module 4: AI Fitness Habit Tracker (Behavioral AI)

Estimates the probability a user skips their next workout based on recent
consistency, and returns a motivational nudge. Every prediction is saved,
so /habits/history can show how consistency trends over time -- the
groundwork for eventually training a real classifier on this logged data
instead of the current rule-based heuristic.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import HabitLog
from models.schemas import HabitTrackRequest
from logic.habit_logic import calculate_skip_risk

router = APIRouter(prefix="/habits", tags=["AI Fitness Habit Tracker"])

NUDGES = {
    "high_risk": "You've missed a few days — even a 10 minute session today keeps the streak alive!",
    "medium_risk": "You're doing okay, but consistency wins. Try to lock in today's workout.",
    "low_risk": "Great consistency! Keep the momentum going.",
}


@router.post("/predict")
def predict_skip_risk(payload: HabitTrackRequest, db: Session = Depends(get_db)):
    workouts_done, skip_probability, risk = calculate_skip_risk(payload.last_7_days)

    log = HabitLog(workouts_last_7_days=workouts_done, skip_probability=skip_probability, risk_level=risk)
    db.add(log)
    db.commit()

    return {
        "workouts_last_7_days": workouts_done,
        "skip_probability": skip_probability,
        "risk_level": risk,
        "nudge_message": NUDGES[risk],
    }


@router.get("/history")
def habit_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(HabitLog).order_by(HabitLog.created_at.desc()).limit(limit).all()
    return [
        {
            "workouts_last_7_days": r.workouts_last_7_days,
            "skip_probability": r.skip_probability,
            "risk_level": r.risk_level,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
