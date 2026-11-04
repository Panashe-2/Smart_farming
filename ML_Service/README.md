# Smart Precision Farming System — Django API Backend

Django + DRF backend implementing the proposal's `/api/crop/`, `/api/soil/`, `/api/irrigate/`
endpoints, loading the three trained scikit-learn models via joblib. SQLite by default so
it runs locally with zero external setup; MySQL notes included for later.

**Note on this package:** the models were verified to load and predict correctly (see
`ml_api/ml_inference.py` — tested directly against the `.pkl` files). The Django wiring
around them (views, URLs, settings) follows standard, well-tested Django/DRF patterns, but
Django itself could not be pip-installed or run in the sandbox that built this package (no
network access there) — so run the steps below yourself to bring it up, and see
"Troubleshooting" if anything doesn't match.

## 1. Setup

```bash
cd smart_farming_backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Initialize the database and run

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/ access
python manage.py runserver
```

The API is now at `http://localhost:8000/`. Visit `http://localhost:8000/` for a health
check, or `http://localhost:8000/admin/` (after createsuperuser) to browse stored data.

## 3. Test the three prediction endpoints

```bash
# Model 1 — Crop Recommendation
curl -X POST http://localhost:8000/api/crop/ \
  -H "Content-Type: application/json" \
  -d '{"zone_id":"zone-1","N":90,"P":42,"K":43,"temperature":25,"humidity":80,"ph":6.5,"rainfall":200}'

# Model 2 — Soil Quality (maize only)
curl -X POST http://localhost:8000/api/soil/ \
  -H "Content-Type: application/json" \
  -d '{"zone_id":"zone-1","temperature":29.5,"humidity":61,"moisture":40,"soil_type":"Loamy"}'

# Model 3 — Precision Irrigation
curl -X POST http://localhost:8000/api/irrigate/ \
  -H "Content-Type: application/json" \
  -d '{"zone_id":"zone-1","soil_moisture":20,"humidity":50,"temperature":32}'
```

Each call is logged to the `Prediction` table automatically (visible in `/admin/` or via
`GET /api/predictions/`), which is what will eventually feed the Model Accuracy Tracker
and the retraining pipeline.

## 4. Try the sensor simulator (Roadmap Step 3 — no hardware needed)

With the server still running, in a second terminal:

```bash
pip install requests   # already in requirements.txt if you installed everything
python sensor_simulator.py --interval 3 --count 10
```

This posts fake readings to `/api/sensor-readings/` and calls `/api/soil/` and
`/api/irrigate/` for each one, so you can watch the whole loop working end-to-end and see
data accumulate for the React dashboard to eventually display.

## Endpoints reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/crop/` | POST | Model 1 prediction |
| `/api/soil/` | POST | Model 2 prediction (maize only) |
| `/api/irrigate/` | POST | Model 3 prediction |
| `/api/sensor-readings/` | GET, POST | Raw sensor log (for dashboard graphs) |
| `/api/predictions/` | GET | Prediction history log |
| `/api/crop-records/` | GET, POST | Crop lifecycle tracking |
| `/api/crop-records/<id>/` | PATCH | Update a crop's status/outcome |

## Switching to MySQL (per the proposal's Data Layer)

1. `pip install mysqlclient` (uncomment it in `requirements.txt`)
2. In `config/settings.py`, comment out the SQLite `DATABASES` block and uncomment the
   MySQL one.
3. Set env vars: `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `MYSQL_PORT`.
4. `python manage.py migrate` again against the new database.

No other code changes needed — everything goes through the Django ORM.

## Known limitations carried over from the models themselves

- **Model 2 (Soil Quality)** is maize-only and modestly accurate (56.8% CV vs 50.5%
  baseline) — the view's docstring and the JSON response both flag this as an advisory,
  not a certainty.
- **Model 3 (Precision Irrigation)** was trained on an engineered proxy target, not real
  litre measurements — do not connect its output directly to pump/valve actuators yet.
- See the main project report (`Smart_Precision_Farming_ML_Report.docx`) for full context
  and the data-collection steps that would improve both.

## Troubleshooting

- **`ModuleNotFoundError: No module named 'django'`** — you're not in the venv, or
  `pip install -r requirements.txt` didn't complete. Re-run both.
- **`django.db.utils.OperationalError`** on first run — run `python manage.py migrate`
  before `runserver`.
- **CORS errors from a React dev server** — `config/settings.py` already allows
  `localhost:3000` and `localhost:5173`; add your dev server's actual origin to
  `CORS_ALLOWED_ORIGINS` if it's different.
- **A pinned package version isn't available for your platform** — drop the `==version`
  pins in `requirements.txt` and install unpinned; the code doesn't rely on anything
  version-specific.
