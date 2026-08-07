"""
Module 5: Virtual Gym Buddy (AI Chat Companion)

Two modes:
1. Rule-based (always available, zero setup) -- keyword sentiment
   detection + canned motivational replies.
2. Real LLM (optional) -- if OPENAI_API_KEY is set as an environment
   variable, every message is answered by an actual language model
   instead of the canned replies, with the fitness-buddy persona set via
   a system prompt.
   Install: pip install openai
   Configure: set OPENAI_API_KEY before starting the server.

Every exchange (whichever mode produced it) is saved to the database so
conversation history can be reviewed via /chat/history.
"""
import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from db_models import ChatLog
from models.schemas import ChatRequest
from logic.chat_logic import detect_sentiment, rule_based_reply

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
    "You are an upbeat, supportive virtual gym buddy inside a fitness app. "
    "Keep replies short (1-3 sentences), motivating, and practical. "
    "Never give medical advice; suggest consulting a professional for injuries or health concerns."
)


def llm_reply(message: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        max_tokens=120,
    )
    return response.choices[0].message.content.strip()


@router.post("/message")
def chat_message(payload: ChatRequest, db: Session = Depends(get_db)):
    sentiment = detect_sentiment(payload.message)

    if LLM_AVAILABLE:
        try:
            reply = llm_reply(payload.message)
            source = "llm"
        except Exception as e:
            # If the API call fails (bad key, network, quota), fall back
            # gracefully instead of erroring the whole request.
            reply = rule_based_reply(sentiment)
            source = f"rule-based (LLM error: {e})"
    else:
        reply = rule_based_reply(sentiment)
        source = "rule-based"

    log = ChatLog(message=payload.message, sentiment=sentiment, reply=reply, source=source)
    db.add(log)
    db.commit()

    return {"sentiment": sentiment, "reply": reply, "source": source}


@router.get("/history")
def chat_history(limit: int = 20, db: Session = Depends(get_db)):
    rows = db.query(ChatLog).order_by(ChatLog.created_at.desc()).limit(limit).all()
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
    return {"llm_available": LLM_AVAILABLE, "mode": "llm" if LLM_AVAILABLE else "rule-based"}
