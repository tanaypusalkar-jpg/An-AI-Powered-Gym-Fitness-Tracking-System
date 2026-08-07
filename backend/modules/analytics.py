"""
Analytics & Visualization support.

Aggregates the logged history from every module into summary stats the
frontend can chart (this is the Plotly/D3.js line item from the original
spec -- the frontend renders the charts with Recharts; this endpoint just
supplies the numbers).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import WorkoutLog, DietLog, HabitLog, PerformanceLog

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
def analytics_summary(limit: int = 14, db: Session = Depends(get_db)):
    workouts = db.query(WorkoutLog).order_by(WorkoutLog.created_at.desc()).limit(limit).all()[::-1]
    diets = db.query(DietLog).order_by(DietLog.created_at.desc()).limit(limit).all()[::-1]
    habits = db.query(HabitLog).order_by(HabitLog.created_at.desc()).limit(limit).all()[::-1]
    performance = db.query(PerformanceLog).order_by(PerformanceLog.created_at.desc()).limit(limit).all()[::-1]

    return {
        "form_score_trend": [
            {"label": r.created_at.strftime("%m/%d %H:%M"), "value": r.form_score} for r in workouts
        ],
        "calorie_trend": [
            {"label": r.created_at.strftime("%m/%d %H:%M"), "target": r.target_calories, "maintenance": r.maintenance_calories}
            for r in diets
        ],
        "skip_probability_trend": [
            {"label": r.created_at.strftime("%m/%d %H:%M"), "value": r.skip_probability} for r in habits
        ],
        "performance_score_trend": [
            {"label": r.created_at.strftime("%m/%d %H:%M"), "value": r.performance_score} for r in performance
        ],
        "totals": {
            "total_workouts_logged": db.query(WorkoutLog).count(),
            "total_diet_plans_generated": db.query(DietLog).count(),
            "total_habit_checks": db.query(HabitLog).count(),
            "total_performance_scores": db.query(PerformanceLog).count(),
        },
    }
