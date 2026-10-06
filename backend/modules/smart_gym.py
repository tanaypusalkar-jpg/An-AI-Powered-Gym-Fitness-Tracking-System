"""
Module 3: Smart Gym Assistant (AI + IoT Integration)

Two ways to get equipment readings in:
1. REST:
   POST /smartgym/status

2. MQTT (optional):
   If paho-mqtt is installed and MQTT_BROKER_HOST is configured,
   the module subscribes to:

       gym/equipment/+/reading

   Expected JSON:
   {
       "equipment_id": "...",
       "current_load_kg": 50,
       "reps_completed": 12,
       "heart_rate": 140
   }
"""

import json
import os
import threading

from fastapi import APIRouter
from models.schemas import SmartGymRequest

router = APIRouter(
    prefix="/smartgym",
    tags=["Smart Gym Assistant"],
)


# ============================================================
# MQTT CONFIGURATION
# ============================================================

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST")

try:
    MQTT_BROKER_PORT = int(
        os.getenv("MQTT_BROKER_PORT", "1883")
    )
except ValueError:
    MQTT_BROKER_PORT = 1883

MQTT_TOPIC = "gym/equipment/+/reading"


# ============================================================
# MQTT IMPORT
# ============================================================

try:
    import paho.mqtt.client as mqtt

    MQTT_LIB_AVAILABLE = True

except ImportError:
    mqtt = None
    MQTT_LIB_AVAILABLE = False


# ============================================================
# STATE
# ============================================================

# Latest MQTT reading for each equipment ID.
latest_mqtt_readings = {}

# Keep a reference to the MQTT client so it isn't garbage-collected.
mqtt_client = None

# Prevent multiple MQTT clients from being started.
mqtt_started = False

# Thread safety for MQTT data.
readings_lock = threading.Lock()


# ============================================================
# WORKOUT / EQUIPMENT ANALYSIS
# ============================================================

def evaluate_reading(
    equipment_id: str,
    load_kg: float,
    reps: int,
    heart_rate: int | None,
):
    """
    Analyze equipment readings and return a recommendation.
    """

    recommendation = "Maintain current resistance."
    rest_seconds = 60

    # Heart-rate safety takes priority.
    if heart_rate is not None and heart_rate > 160:
        recommendation = (
            "Heart rate high — reduce resistance "
            "and take a longer rest."
        )
        rest_seconds = 120

    # Too many reps means resistance may be too easy.
    elif reps >= 15:
        recommendation = (
            "Reps are easy at this load — "
            "consider increasing resistance."
        )
        rest_seconds = 45

    # Too few reps means resistance may be too difficult.
    elif reps <= 5:
        recommendation = (
            "Struggling with reps — "
            "consider lowering resistance."
        )
        rest_seconds = 90

    return {
        "equipment_id": equipment_id,
        "current_load_kg": load_kg,
        "reps_completed": reps,
        "heart_rate": heart_rate,
        "recommendation": recommendation,
        "suggested_rest_seconds": rest_seconds,
    }


# ============================================================
# REST API
# ============================================================

@router.post("/status")
def smart_gym_status(payload: SmartGymRequest):
    """
    Analyze an equipment reading received through REST.
    """

    result = evaluate_reading(
        payload.equipment_id,
        payload.current_load_kg,
        payload.reps_completed,
        payload.heart_rate,
    )

    return result


@router.get("/mqtt-status")
def mqtt_status():
    """
    Return MQTT configuration and latest MQTT readings.
    """

    with readings_lock:
        readings = dict(latest_mqtt_readings)

    return {
        "mqtt_library_installed": MQTT_LIB_AVAILABLE,
        "broker_configured": bool(MQTT_BROKER_HOST),
        "broker_host": MQTT_BROKER_HOST,
        "broker_port": MQTT_BROKER_PORT,
        "listening_topic": (
            MQTT_TOPIC
            if MQTT_LIB_AVAILABLE and MQTT_BROKER_HOST
            else None
        ),
        "mqtt_running": mqtt_started,
        "latest_readings": readings,
    }


# ============================================================
# MQTT MESSAGE HANDLER
# ============================================================

def _on_message(client, userdata, msg):
    """
    Process an MQTT message.

    Malformed messages are ignored instead of crashing
    the MQTT listener.
    """

    try:
        raw_payload = msg.payload.decode("utf-8")

        data = json.loads(raw_payload)

        equipment_id = str(
            data.get("equipment_id", "unknown")
        )

        load_kg = float(
            data.get("current_load_kg", 0)
        )

        reps = int(
            data.get("reps_completed", 0)
        )

        heart_rate = data.get("heart_rate")

        if heart_rate is not None:
            heart_rate = int(heart_rate)

        result = evaluate_reading(
            equipment_id=equipment_id,
            load_kg=load_kg,
            reps=reps,
            heart_rate=heart_rate,
        )

        with readings_lock:
            latest_mqtt_readings[equipment_id] = result

        print(
            f"[smart_gym MQTT] Reading received: "
            f"{equipment_id}"
        )

    except json.JSONDecodeError:
        print(
            "[smart_gym MQTT] Invalid JSON received."
        )

    except (ValueError, TypeError) as e:
        print(
            f"[smart_gym MQTT] Invalid reading: {e}"
        )

    except Exception as e:
        # Never allow a bad MQTT message to kill the listener.
        print(
            f"[smart_gym MQTT] Failed to process message: {e}"
        )


# ============================================================
# MQTT CONNECTION CALLBACKS
# ============================================================

def _on_connect(client, userdata, flags, rc, properties=None):
    """
    Called when MQTT connection succeeds or fails.
    """

    if rc == 0:
        print(
            f"[smart_gym] MQTT connected to "
            f"{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}"
        )

        try:
            result, _ = client.subscribe(MQTT_TOPIC)

            if result == mqtt.MQTT_ERR_SUCCESS:
                print(
                    f"[smart_gym] Subscribed to {MQTT_TOPIC}"
                )
            else:
                print(
                    f"[smart_gym] MQTT subscribe failed: {result}"
                )

        except Exception as e:
            print(
                f"[smart_gym] MQTT subscription error: {e}"
            )

    else:
        print(
            f"[smart_gym] MQTT connection failed. "
            f"Return code: {rc}"
        )


def _on_disconnect(
    client,
    userdata,
    disconnect_flags=None,
    rc=None,
    properties=None,
):
    """
    Called when MQTT disconnects.
    """

    print(
        f"[smart_gym] MQTT disconnected. "
        f"Return code: {rc}"
    )


# ============================================================
# START MQTT
# ============================================================

def start_mqtt_listener():
    """
    Start the MQTT listener.

    IMPORTANT:
    MQTT is optional. If the broker is unavailable,
    FastAPI must continue running normally.
    """

    global mqtt_client
    global mqtt_started

    # Prevent duplicate startup.
    if mqtt_started:
        print(
            "[smart_gym] MQTT listener already running."
        )
        return

    # paho-mqtt isn't installed.
    if not MQTT_LIB_AVAILABLE:
        print(
            "[smart_gym] paho-mqtt is not installed. "
            "MQTT disabled."
        )
        return

    # Broker isn't configured.
    if not MQTT_BROKER_HOST:
        print(
            "[smart_gym] MQTT_BROKER_HOST is not configured. "
            "MQTT disabled."
        )
        return

    try:
        # Paho MQTT versions can differ slightly.
        mqtt_client = mqtt.Client()

        mqtt_client.on_connect = _on_connect
        mqtt_client.on_message = _on_message
        mqtt_client.on_disconnect = _on_disconnect

        print(
            f"[smart_gym] Connecting to MQTT broker "
            f"{MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}..."
        )

        mqtt_client.connect(
            MQTT_BROKER_HOST,
            MQTT_BROKER_PORT,
            keepalive=60,
        )

        # Run MQTT networking in the background.
        mqtt_client.loop_start()

        mqtt_started = True

        print(
            "[smart_gym] MQTT listener started successfully."
        )

    except Exception as e:
        # CRITICAL:
        # MQTT failure must NOT prevent FastAPI from starting.
        mqtt_client = None
        mqtt_started = False

        print(
            f"[smart_gym] MQTT unavailable: {e}"
        )

        print(
            "[smart_gym] Continuing without MQTT."
        )


# ============================================================
# STOP MQTT
# ============================================================

def stop_mqtt_listener():
    """
    Safely stop the MQTT listener.
    """

    global mqtt_client
    global mqtt_started

    if mqtt_client is None:
        return

    try:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()

    except Exception as e:
        print(
            f"[smart_gym] MQTT shutdown error: {e}"
        )

    finally:
        mqtt_client = None
        mqtt_started = False

        print(
            "[smart_gym] MQTT listener stopped."
        )