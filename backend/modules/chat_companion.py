"""
Module 5: Virtual Gym Buddy (AI Chat Companion).

Supports FAQ-first responses without API keys, with an optional OpenAI
LLM for questions that aren't covered by the FAQ. Exchanges are persisted
to the database and can be reviewed via /chat/history.
"""
import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import ChatLog
from models.schemas import ChatRequest
from logic.chat_logic import detect_sentiment, faq_reply, rule_based_reply

router = APIRouter(prefix="/chat", tags=["Virtual Gym Buddy"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

try:
    from openai import OpenAI
    LLM_AVAILABLE = bool(OPENAI_API_KEY)
    client = OpenAI(api_key=OPENAI_API_KEY) if LLM_AVAILABLE else None
except ImportError:
    LLM_AVAILABLE = False
    client = None

SYSTEM_PROMPT = (
    "You are the helpful Virtual Gym Buddy inside an AI fitness app. "
    "Answer basic client questions about using the app, beginner workouts, "
    "exercise habits, recovery, and general nutrition, including macronutrients, micronutrients, vitamins, minerals, food sources, and hydration. Keep replies concise, "
    "friendly, and practical (usually 2-5 sentences). Do not claim that you "
    "performed an action in the app. Do not diagnose conditions or provide "
    "medical advice. For injuries, concerning symptoms, or medical questions, "
    "recommend a qualified healthcare professional. Provide general nutrition education, not personalized diagnosis or treatment. Do not diagnose nutrient deficiencies from symptoms, prescribe supplement doses, or imply supplements are always needed. Explain that nutrient needs vary by age, health, diet, and activity, and encourage varied foods. Avoid extreme dieting, "
    "unsafe exercise instructions, or guarantees about results."
)


def llm_reply(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        max_tokens=220,
    )
    reply = response.choices[0].message.content
    return reply.strip() if reply else (
        "I couldn't prepare a reply just now. Please try asking in a different way."
    )


@router.post("/message")
def chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    message = payload.message.strip()
    sentiment = detect_sentiment(message)

    # Answer known questions deterministically before using an LLM.
    reply = faq_reply(message)
    source = "faq" if reply is not None else "rule-based"

    if reply is None and LLM_AVAILABLE:
        try:
            reply = llm_reply(message)
            source = "llm"
        except Exception:
            # Keep the chat usable if the external AI service is unavailable.
            reply = rule_based_reply(sentiment)
            source = "rule-based"

    if reply is None:
        reply = rule_based_reply(sentiment)

    log = ChatLog(
        message=message,
        sentiment=sentiment,
        reply=reply,
        source=source,
    )
    db.add(log)
    db.commit()

    return {"sentiment": sentiment, "reply": reply, "source": source}


@router.get("/history")
def chat_history(limit: int = 20, db: Session = Depends(get_db)):
    # Bound the request so clients cannot ask for an unbounded result set.
    safe_limit = max(1, min(limit, 100))
    rows = db.query(ChatLog).order_by(ChatLog.created_at.desc()).limit(safe_limit).all()
    return [
        {
            "message": r.message,
            "sentiment": r.sentiment,
            "reply": r.reply,
            "source": r.source,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/status")
def chat_status():
    return {
        "llm_available": LLM_AVAILABLE,
        "mode": "faq+llm" if LLM_AVAILABLE else "faq+rule-based",
    }