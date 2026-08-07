"""
Run this to get real accuracy / precision / recall / F1 numbers for the
project's two rule-based classifiers, evaluated against hand-labeled test
sets.

Usage (from the backend/ folder):
    python -m evaluation.run_evaluation

No extra dependencies required -- uses only the standard library plus the
project's own logic modules.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # backend/

from logic.habit_logic import calculate_skip_risk
from logic.chat_logic import detect_sentiment
from evaluation.test_data import HABIT_TEST_CASES, CHAT_TEST_CASES
from evaluation.metrics import print_report


def evaluate_habit_tracker():
    y_true = [label for _, label in HABIT_TEST_CASES]
    y_pred = [calculate_skip_risk(pattern)[2] for pattern, _ in HABIT_TEST_CASES]
    labels = ["low_risk", "medium_risk", "high_risk"]
    return print_report("Habit Tracker — Skip Risk Classification", y_true, y_pred, labels)


def evaluate_chat_sentiment():
    y_true = [label for _, label in CHAT_TEST_CASES]
    y_pred = [detect_sentiment(message) for message, _ in CHAT_TEST_CASES]
    labels = ["positive", "neutral", "negative"]
    return print_report("Chat Companion — Sentiment Classification", y_true, y_pred, labels)


if __name__ == "__main__":
    habit_results = evaluate_habit_tracker()
    chat_results = evaluate_chat_sentiment()

    print(f"\n{'=' * 60}")
    print("  SUMMARY")
    print(f"{'=' * 60}")
    print(f"Habit Tracker accuracy: {habit_results['accuracy']:.1%}  |  macro F1: {habit_results['metrics']['macro avg']['f1']:.3f}")
    print(f"Chat Sentiment accuracy: {chat_results['accuracy']:.1%}  |  macro F1: {chat_results['metrics']['macro avg']['f1']:.3f}")
