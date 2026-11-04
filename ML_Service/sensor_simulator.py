"""
sensor_simulator.py
--------------------
Generates plausible sensor readings on a timer and POSTs them to the running Django
API, so you can develop and demo the full sensors -> API -> dashboard loop before the
Raspberry Pi/Arduino and physical sensors are wired up (Step 3 of the roadmap).

Usage:
    python sensor_simulator.py                       # runs forever, one reading every 15s
    python sensor_simulator.py --interval 5 --count 20   # 20 readings, 5s apart
    python sensor_simulator.py --base-url http://localhost:8000

Each tick:
    1. Posts a simulated reading to /api/sensor-readings/ (so it shows up in sensor graphs)
    2. Calls /api/soil/ and /api/irrigate/ with that same reading (so Prediction History fills up)
"""
import argparse
import random
import time
from typing import Optional
import requests

ZONES = ["zone-1", "zone-2", "zone-3"]
SOIL_TYPES = ["Black", "Clayey", "Loamy", "Red", "Sandy"]


def make_reading(zone_id):
    return {
        "zone_id": zone_id,
        "crop_id": "maize",
        "soil_moisture": round(random.uniform(15, 65), 1),
        "temperature": round(random.uniform(18, 36), 1),
        "humidity": round(random.uniform(35, 90), 1),
        "soil_type": random.choice(SOIL_TYPES),
    }


def run(base_url: str, interval: float, count: Optional[int]):
    tick = 0
    while count is None or tick < count:
        zone = random.choice(ZONES)
        reading = make_reading(zone)

        try:
            r1 = requests.post(f"{base_url}/api/sensor-readings/", json=reading, timeout=5)
            r2 = requests.post(f"{base_url}/api/soil/", json=reading, timeout=5)
            r3 = requests.post(f"{base_url}/api/irrigate/", json=reading, timeout=5)
            print(
                f"[{zone}] moisture={reading['soil_moisture']} temp={reading['temperature']} "
                f"humidity={reading['humidity']} soil={reading['soil_type']} "
                f"-> sensor:{r1.status_code} soil:{r2.status_code} irrigate:{r3.status_code}"
            )
            if r2.ok:
                print("    soil ->", r2.json())
            if r3.ok:
                print("    irrigate ->", r3.json())
        except requests.exceptions.ConnectionError:
            print(f"Could not reach {base_url} - is `python manage.py runserver` running?")
            return

        tick += 1
        time.sleep(interval)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate sensor readings against the Django API.")
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--interval", type=float, default=15, help="Seconds between readings")
    parser.add_argument("--count", type=int, default=None, help="Number of readings (default: run forever)")
    args = parser.parse_args()
    run(args.base_url, args.interval, args.count)
