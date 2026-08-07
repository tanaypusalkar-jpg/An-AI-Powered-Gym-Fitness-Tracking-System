"""
Module 6: Pose-to-Performance Analyzer

Combines reps, session duration, and form quality into a single weighted
'Performance Score' (0-100). Every score is saved so weekly progress
reports can be generated from /performance/history.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import PerformanceLog
from models.schemas import PerformanceRequest

router = APIRouter(prefix="/performance", tags=["Pose-to-Performance Analyzer"])

WEIGHT_FORM = 0.5
WEIGHT_REPS = 0.3
WEIGHT_EFFICIENCY = 0.2


@router.post("/score")
def performance_score(payload: PerformanceRequest, db: Session = Depends(get_db)):
    reps_score = min(payload.reps / 20 * 100, 100)
    efficiency_score = min((payload.reps / max(payload.duration_minutes, 0.1)) / 2 * 100, 100)

    total_score = round(
        payload.form_score * WEIGHT_FORM
        + reps_score * WEIGHT_REPS
        + efficiency_score * WEIGHT_EFFICIENCY,
        1,
    )

    log = PerformanceLog(
        performance_score=total_score,
        reps=payload.reps,
        duration_minutes=payload.duration_minutes,
        form_score=payload.form_score,
    )
    db.add(log)
    db.commit()

    return {
        "performance_score": total_score,
        "breakdown": {
            "form_score": payload.form_score,
            "reps_score": round(reps_score, 1),
            "efficiency_score": round(efficiency_score, 1),
        },
    }


@router.get("/history")
def performance_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(PerformanceLog).order_by(PerformanceLog.created_at.desc()).limit(limit).all()
    return [
        {
            "performance_score": r.performance_score,
            "reps": r.reps,
            "duration_minutes": r.duration_minutes,
            "form_score": r.form_score,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
