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


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal"
    if bmi < 30:
        return "Overweight"
    return "Obese"


def calculate_macros(target_calories: float, weight_kg: float, goal: str) -> dict:
    """Protein from body weight, fat = 25% of calories, carbs = the rest."""
    protein_per_kg = {"lose": 2.0, "gain": 1.8}.get(goal, 1.6)
    protein_g = round(weight_kg * protein_per_kg)
    fat_g = round(target_calories * 0.25 / 9)
    carbs_g = max(0, round((target_calories - protein_g * 4 - fat_g * 9) / 4))
    return {"protein_g": protein_g, "carbs_g": carbs_g, "fat_g": fat_g}


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

    goal = payload.goal.lower()

    # Safety warning for very low targets
    min_safe = 1500 if payload.gender.lower() == "male" else 1200
    warning = None
    if target_calories < min_safe:
        warning = (
            "Target calories are very low. Do not go this low "
            "without a doctor or dietician."
        )
    elif goal == "lose" and bmi < 18.5:
        warning = "Your BMI is already underweight. Losing weight is not advised."

    return {
        "bmi": bmi,
        "bmi_category": bmi_category(bmi),
        "bmr": round(bmr),
        "maintenance_calories": round(maintenance_calories),
        "target_calories": round(target_calories),
        "goal": goal,
        "macros": calculate_macros(target_calories, payload.weight_kg, goal),
        "warning": warning,
        "grocery_list": GROCERY_LISTS.get(goal, GROCERY_LISTS["maintain"]),
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