# AI Gym & Fitness Assistant

A complete, runnable implementation of the "AI Gym & Fitness Assistant" spec:
workout detection, diet planning, IoT smart gym assistance, behavior
tracking, a chat companion, performance scoring, gym recommendations, and
analytics — with a persistent database and optional real AI/ML/IoT
integrations you can turn on as you go.

**Every module works out of the box with zero API keys** using transparent
rule-based logic. Each one also has an optional "real" mode (real computer
vision, a real LLM, a real MQTT broker, a real place search) that activates
automatically the moment you install the extra package and set the matching
environment variable — no code changes needed.

## Project Structure

```
ai-gym-fitness-assistant/
├── package.json                 # root runner (npm run dev -> both servers)
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py               # SQLAlchemy engine/session (SQLite by default)
│   ├── db_models.py              # ORM tables — one per module
│   ├── requirements.txt
│   ├── .env.example               # optional integrations config
│   ├── uploads/                   # stored workout images (local stand-in for S3/Firebase)
│   ├── models/
│   │   └── schemas.py            # Pydantic request models
│   └── modules/
│       ├── workout_trainer.py        # 1. AI Gym Trainer (+ optional MediaPipe)
│       ├── diet_coach.py             # 2. AI Dietician & Calorie Coach
│       ├── smart_gym.py              # 3. Smart Gym Assistant (+ optional MQTT)
│       ├── habit_tracker.py          # 4. AI Fitness Habit Tracker
│       ├── chat_companion.py         # 5. Virtual Gym Buddy (+ optional LLM)
│       ├── performance_analyzer.py   # 6. Pose-to-Performance Analyzer
│       ├── gym_recommender.py        # 7. Gym Recommender (+ optional Google Places)
│       └── analytics.py              # 8. Analytics/history aggregation
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/            # one tab per module + Analytics dashboard
```

## Run Both Servers with One Command

```bash
cd ai-gym-fitness-assistant
npm install
npm run install:all   # first time only: creates backend venv + installs both sides
npm run dev
```
Backend: http://127.0.0.1:8000 (docs at `/docs`) · Frontend: http://127.0.0.1:5173

## What's Now Fully Implemented

### 1. Persistent Database (SQLite via SQLAlchemy)
Every module now saves every result it produces to `backend/fitness.db`
(created automatically on first run). Each module has a matching
`GET .../history` endpoint, and `/analytics/summary` aggregates everything
for the new **Analytics tab** in the dashboard, which charts form-score
trends, calorie targets, skip-risk, and performance score over time using
Recharts.

No setup required — this works immediately.

### 2. Local File Storage (stand-in for AWS S3 / Firebase)
Uploaded workout images are saved under `backend/uploads/` and served back
at `http://127.0.0.1:8000/uploads/...`. Swap this for real S3/Firebase later
by changing the save logic in `workout_trainer.py`.

## Evaluating Accuracy / F1 Score

Two modules act as classifiers even though they're rule-based: the
**Habit Tracker** (predicts risk level: low/medium/high) and the **Chat
Companion** (predicts sentiment: positive/neutral/negative). Both are
evaluated against hand-labeled test sets in `backend/evaluation/`.

Run it (no extra dependencies needed):
```bash
cd backend
python -m evaluation.run_evaluation
```

This prints accuracy, per-class precision/recall/F1, macro-averaged F1,
and a confusion matrix for each classifier. Latest results:

| Classifier | Accuracy | Macro F1 |
|---|---|---|
| Habit Tracker (risk level) | 100% | 1.000 |
| Chat Companion (sentiment) | 75% | 0.769 |

The sentiment classifier's errors are informative: keyword matching
misreads negation ("I'm **not sad**") and mixed-signal messages ("I
**hate** mornings but I **love** workouts") because it triggers on the
first matching word rather than understanding context — a concrete
example of why the optional LLM upgrade (see above) produces better
results than the rule-based fallback.

To evaluate your own test cases, edit `backend/evaluation/test_data.py`
and re-run the script.

## Optional "Real AI" Upgrades

Each of these is off by default (rule-based fallback is always active) and
turns on the moment you install the package + set the environment variable.
Copy `backend/.env.example` to `backend/.env` (or export the variables
directly) and fill in what you want to enable.

| Module | Real upgrade | Install | Env variable |
|---|---|---|---|
| AI Gym Trainer | Real pose detection via MediaPipe on an uploaded photo (`POST /workout/analyze-image`) | `pip install mediapipe opencv-python-headless` | none needed |
| Virtual Gym Buddy | Real LLM-generated replies (OpenAI) | `pip install openai` | `OPENAI_API_KEY` |
| Smart Gym Assistant | Real MQTT listener for IoT equipment | `pip install paho-mqtt` | `MQTT_BROKER_HOST` (+ optional `MQTT_BROKER_PORT`) |
| Gym Recommender | Real gym search via Google Places | `pip install requests` | `GOOGLE_PLACES_API_KEY` |

Uncomment the matching lines in `backend/requirements.txt`, then:
```bash
uv pip install -r requirements.txt
```

If a key/package isn't set, the endpoint automatically falls back to its
rule-based behavior — nothing breaks.

### Testing the MediaPipe pose endpoint
```bash
curl -X POST "http://127.0.0.1:8000/workout/analyze-image?exercise=squat" \
  -F "file=@/path/to/photo.jpg"
```

### Testing the MQTT listener
Publish a JSON reading to `gym/equipment/<id>/reading` on your broker, e.g.
with `mosquitto_pub`:
```bash
mosquitto_pub -h localhost -t gym/equipment/treadmill01/reading \
  -m '{"equipment_id":"treadmill01","current_load_kg":20,"reps_completed":12,"heart_rate":150}'
```
Then check `GET /smartgym/mqtt-status` to see the latest reading received.

## Still Not Wired Up (by design, for later)
- **Node-RED flows** for equipment dashboards — MQTT topic/payload shape is
  documented above so a Node-RED flow can publish directly to it.
- **User authentication / accounts** — all data is currently global, not
  per-user; add an auth layer + a `user_id` column on each table when ready.
- **Cloud deployment** — currently local-only; deploy the backend (e.g.
  Render/Railway) and frontend (e.g. Vercel/Netlify) separately, then update
  `API_BASE` in `frontend/src/api.js`.

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Recharts for analytics charts |
| Backend | Python, FastAPI, Uvicorn |
| Validation | Pydantic |
| Database | SQLite via SQLAlchemy (swap `DATABASE_URL` for PostgreSQL anytime) |
| Computer Vision (optional) | MediaPipe + OpenCV |
| Conversational AI (optional) | OpenAI API |
| IoT (optional) | MQTT via paho-mqtt |
| Places search (optional) | Google Places API |
| Package managers | uv (Python), npm (JS) |
| Dev orchestration | concurrently (root `npm run dev`) |


============================================================
  Habit Tracker — Skip Risk Classification
============================================================
Test cases: 20
Accuracy:   1.000

Class         Precision   Recall    F1      Support
low_risk      1.0         1.0       1.0     7
medium_risk   1.0         1.0       1.0     7
high_risk     1.0         1.0       1.0     6
macro avg     1.0         1.0       1.0     20

Confusion matrix (rows = true label, columns = predicted label):
              low_risk      medium_risk   high_risk     
low_risk      7             0             0             
medium_risk   0             7             0             
high_risk     0             0             6             

============================================================
  Chat Companion — Sentiment Classification
============================================================
Test cases: 20
Accuracy:   0.750

Class         Precision   Recall    F1      Support
positive      0.833       0.556     0.667   9
neutral       1.0         0.8       0.889   5
negative      0.6         1.0       0.75    6
macro avg     0.811       0.785     0.769   20

Confusion matrix (rows = true label, columns = predicted label):
              positive      neutral       negative      
positive      5             0             4             
neutral       1             4             0             
negative      0             0             6             

============================================================
  SUMMARY
============================================================
Habit Tracker accuracy: 100.0%  |  macro F1: 1.000
Chat Sentiment accuracy: 75.0%  |  macro F1: 0.769