"""
Pure sentiment-classification logic for the Virtual Gym Buddy, kept
separate from the FastAPI route (chat_companion.py) so it can be imported
and evaluated (accuracy/F1) without needing the web server, database, or
any other dependency running.
"""

NEGATIVE_WORDS = ["tired", "sad", "lazy", "hate", "sore", "quit", "can't", "cant", "hard", "pain"]
POSITIVE_WORDS = ["great", "strong", "happy", "excited", "love", "did it", "proud", "good"]


def detect_sentiment(message: str) -> str:
    text = message.lower()
    if any(word in text for word in NEGATIVE_WORDS):
        return "negative"
    if any(word in text for word in POSITIVE_WORDS):
        return "positive"
    return "neutral"


def rule_based_reply(sentiment: str) -> str:
    if sentiment == "negative":
        return "I hear you — tough days happen. Even a short 10-minute walk counts. You've got this!"
    if sentiment == "positive":
        return "Love the energy! Let's keep that momentum going in today's session."
    return "I'm here to help with your workouts, diet, or motivation — what's on your mind?"
