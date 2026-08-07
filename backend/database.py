"""
Database setup (SQLAlchemy + SQLite).

SQLite was chosen over MongoDB/PostgreSQL for this stage because it needs
zero external setup (no server, no Docker, no connection string) -- the
whole database is a single file, fitness.db, created automatically on
first run. That keeps the project runnable with one command.

To move to PostgreSQL or MongoDB later:
- PostgreSQL: change DATABASE_URL below to
  "postgresql://user:password@localhost:5432/fitness_db" and
  `pip install psycopg2-binary`. The SQLAlchemy models in db_models.py
  need no changes.
- MongoDB: swap SQLAlchemy for a MongoDB client (e.g. pymongo/motor) and
  rewrite db_models.py as plain dict schemas -- this is a bigger change
  since MongoDB is not a drop-in replacement for a relational ORM.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitness.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Create all tables. Called once on app startup (see main.py)."""
    from db_models import (  # noqa: F401 -- import so tables register on Base.metadata
        WorkoutLog, DietLog, HabitLog, ChatLog, PerformanceLog, GymRecommendationLog,
    )
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency that yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
