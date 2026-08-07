"""
Pure classification logic for the AI Fitness Habit Tracker, kept separate
from the FastAPI route (habit_tracker.py) so it can be imported and
evaluated (accuracy/F1) without needing the web server, database, or any
other dependency running.
"""


def calculate_skip_risk(last_7_days: list[bool]):
    """Classifies workout-skip risk from a 7-day attendance pattern.
    Returns (workouts_done, skip_probability, risk_label)."""
    workouts_done = sum(last_7_days)
    skip_probability = round(1 - (workouts_done / max(len(last_7_days), 1)), 2)

    if skip_probability >= 0.6:
        risk = "high_risk"
    elif skip_probability >= 0.3:
        risk = "medium_risk"
    else:
        risk = "low_risk"

    return workouts_done, skip_probability, risk
