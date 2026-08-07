"""
Module 7: Gym Recommender & Planner

Two modes:
1. Mock data (always available) -- deterministic sample gym names built
   from the city you enter.
2. Real Google Places lookup (optional) -- if GOOGLE_PLACES_API_KEY is
   set, this calls the Places API Text Search for "gyms in <city>" and
   returns real, ranked results instead of the mock list.
   Configure: set GOOGLE_PLACES_API_KEY before starting the server.
   (No extra pip install needed -- uses `requests`, add it to
   requirements.txt if not already present.)
"""
import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import GymRecommendationLog
from models.schemas import GymRecommendRequest

router = APIRouter(prefix="/recommend", tags=["Gym Recommender & Planner"])

GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

PROGRAMS_BY_GOAL = {
    "weight loss": ["HIIT Circuit", "Cardio + Core", "30-Day Fat Burn Challenge"],
    "muscle gain": ["Push/Pull/Legs Split", "Progressive Overload Program", "5x5 Strength"],
    "general fitness": ["Full Body 3x/week", "Beginner Bootcamp", "Mobility + Strength"],
}


def mock_gyms(city: str):
    return [f"{city} Fitness Hub", f"PowerFit {city}", f"{city} CrossTrain Studio"]


def real_gyms(city: str):
    import requests  # local import so the app doesn't require `requests` unless this path is used
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": f"gyms in {city}", "key": GOOGLE_PLACES_API_KEY}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    results = resp.json().get("results", [])[:5]
    return [r["name"] for r in results] if results else mock_gyms(city)


@router.post("/gyms")
def recommend_gyms(payload: GymRecommendRequest, db: Session = Depends(get_db)):
    programs = PROGRAMS_BY_GOAL.get(payload.goal.lower(), PROGRAMS_BY_GOAL["general fitness"])

    if GOOGLE_PLACES_API_KEY:
        try:
            gyms = real_gyms(payload.city)
            source = "google_places"
        except Exception as e:
            gyms = mock_gyms(payload.city)
            source = f"mock (Places API error: {e})"
    else:
        gyms = mock_gyms(payload.city)
        source = "mock"

    log = GymRecommendationLog(city=payload.city, goal=payload.goal, source=source)
    db.add(log)
    db.commit()

    return {
        "city": payload.city,
        "goal": payload.goal,
        "recommended_gyms": gyms,
        "recommended_programs": programs,
        "source": source,
    }


@router.get("/history")
def recommend_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(GymRecommendationLog).order_by(GymRecommendationLog.created_at.desc()).limit(limit).all()
    return [
        {"city": r.city, "goal": r.goal, "source": r.source, "created_at": r.created_at.isoformat()}
        for r in rows
    ]
