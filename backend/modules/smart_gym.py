"""
Module 3: Smart Gym Assistant (AI + IoT Integration)

Two ways to get equipment readings in:
1. REST (always available) -- POST /smartgym/status with the latest reading.
2. Real MQTT (optional) -- if paho-mqtt is installed and MQTT_BROKER_HOST
   is set, this module subscribes to topic "gym/equipment/+/reading" on
   startup. Any IoT device (or a Node-RED flow) publishing JSON like
   {"equipment_id": "...", "current_load_kg": .., "reps_completed": ..,
   "heart_rate": ..} to that topic gets the same rule-based analysis
   automatically, with no REST call needed.

   Install: pip install paho-mqtt
   Configure: set MQTT_BROKER_HOST (and optionally MQTT_BROKER_PORT,
   default 1883) as environment variables before starting the server.
"""
import json
import os

from fastapi import APIRouter
from models.schemas import SmartGymRequest

router = APIRouter(prefix="/smartgym", tags=["Smart Gym Assistant"])

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
MQTT_TOPIC = "gym/equipment/+/reading"

try:
    import paho.mqtt.client as mqtt
    MQTT_LIB_AVAILABLE = True
except ImportError:
    MQTT_LIB_AVAILABLE = False

# In-memory store of the latest readings received over MQTT, so the REST
# API can expose them even though they arrived asynchronously.
latest_mqtt_readings = {}


def evaluate_reading(equipment_id: str, load_kg: float, reps: int, heart_rate: int | None):
    recommendation = "Maintain current resistance."
    rest_seconds = 60

    if heart_rate and heart_rate > 160:
        recommendation = "Heart rate high — reduce resistance and take a longer rest."
        rest_seconds = 120
    elif reps >= 15:
        recommendation = "Reps are easy at this load — consider increasing resistance."
        rest_seconds = 45
    elif reps <= 5:
        recommendation = "Struggling with reps — consider lowering resistance."
        rest_seconds = 90

    return {
        "equipment_id": equipment_id,
        "recommendation": recommendation,
        "suggested_rest_seconds": rest_seconds,
    }


@router.post("/status")
def smart_gym_status(payload: SmartGymRequest):
    return evaluate_reading(payload.equipment_id, payload.current_load_kg, payload.reps_completed, payload.heart_rate)


@router.get("/mqtt-status")
def mqtt_status():
    return {
        "mqtt_library_installed": MQTT_LIB_AVAILABLE,
        "broker_configured": bool(MQTT_BROKER_HOST),
        "broker_host": MQTT_BROKER_HOST,
        "listening_topic": MQTT_TOPIC if MQTT_LIB_AVAILABLE and MQTT_BROKER_HOST else None,
        "latest_readings": latest_mqtt_readings,
    }


def _on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        result = evaluate_reading(
            data.get("equipment_id", "unknown"),
            data.get("current_load_kg", 0),
            data.get("reps_completed", 0),
            data.get("heart_rate"),
        )
        latest_mqtt_readings[result["equipment_id"]] = result
    except Exception as e:  # keep the listener alive even on a malformed message
        print(f"[smart_gym MQTT] failed to process message: {e}")


def start_mqtt_listener():
    """Called once from main.py on startup. No-ops safely if paho-mqtt
    isn't installed or no broker host is configured."""
    if not MQTT_LIB_AVAILABLE or not MQTT_BROKER_HOST:
        return
    client = mqtt.Client()
    client.on_message = _on_message
    client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, keepalive=60)
    client.subscribe(MQTT_TOPIC)
    client.loop_start()
    print(f"[smart_gym] MQTT listener connected to {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
