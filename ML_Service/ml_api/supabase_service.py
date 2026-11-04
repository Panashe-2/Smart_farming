
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")

ALLOWED_TABLES = {
    "farm_zones",
    "sensor_readings",
    "predictions",
    "crop_records",
    "alerts",
    "irrigation_logs",
}


def get_records(table, limit=10):
    if table not in ALLOWED_TABLES:
        raise ValueError("Invalid table name")

    if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
        raise RuntimeError("Supabase settings are missing")

    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={
            "apikey": SUPABASE_SECRET_KEY,
            "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
        },
        params={
            "select": "*",
            "limit": max(1, min(int(limit), 100)),
        },
        timeout=15,
    )

    response.raise_for_status()
    return response.json()

