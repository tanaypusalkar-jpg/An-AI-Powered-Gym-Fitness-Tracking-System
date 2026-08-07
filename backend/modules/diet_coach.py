"""
Module 2: AI Dietician & Calorie Coach

Uses the Mifflin-St Jeor equation for BMR + an activity multiplier to
estimate daily calorie needs, then adjusts for the user's goal. Every
plan generated is saved to the database so progress/trend can be tracked
over time via /diet/history.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import DietLog
from models.schemas import DietPlanRequest

router = APIRouter(prefix="/diet", tags=["AI Dietician & Calorie Coach"])

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
}

GROCERY_LISTS = {
    "lose": ["Leafy greens", "Chicken breast", "Eggs", "Greek yogurt", "Oats", "Berries"],
    "maintain": ["Brown rice", "Mixed vegetables", "Fish", "Nuts", "Whole wheat bread", "Fruit"],
    "gain": ["Peanut butter", "Whole milk", "Rice", "Beef/paneer", "Bananas", "Protein powder"],
}


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    if gender.lower() == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


@router.post("/plan")
def diet_plan(payload: DietPlanRequest, db: Session = Depends(get_db)):
    bmi = calculate_bmi(payload.weight_kg, payload.height_cm)
    bmr = calculate_bmr(payload.weight_kg, payload.height_cm, payload.age, payload.gender)
    multiplier = ACTIVITY_MULTIPLIERS.get(payload.activity_level.lower(), 1.2)
    maintenance_calories = bmr * multiplier

    if payload.goal.lower() == "lose":
        target_calories = maintenance_calories - 500
    elif payload.goal.lower() == "gain":
        target_calories = maintenance_calories + 500
    else:
        target_calories = maintenance_calories

    log = DietLog(
        bmi=bmi,
        maintenance_calories=round(maintenance_calories),
        target_calories=round(target_calories),
        goal=payload.goal,
    )
    db.add(log)
    db.commit()

    return {
        "bmi": bmi,
        "maintenance_calories": round(maintenance_calories),
        "target_calories": round(target_calories),
        "grocery_list": GROCERY_LISTS.get(payload.goal.lower(), GROCERY_LISTS["maintain"]),
    }


@router.get("/history")
def diet_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(DietLog).order_by(DietLog.created_at.desc()).limit(limit).all()
    return [
        {
            "bmi": r.bmi,
            "maintenance_calories": r.maintenance_calories,
            "target_calories": r.target_calories,
            "goal": r.goal,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]
