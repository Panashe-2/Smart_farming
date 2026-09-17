"""
ml_inference.py
----------------
Loads all three trained models once (at Django startup, via the singleton instances
at the bottom of this file) and exposes a simple .predict(...) per model. Views call
these instances directly - no request-time joblib.load(), which would be slow.
"""
import os
import joblib
import pandas as pd

ML_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ml_models")


class CropRecommendationModel:
    """Model 1: N, P, K, temperature, humidity, ph, rainfall -> recommended crop."""

    def __init__(self, path=None):
        path = path or os.path.join(ML_MODELS_DIR, "model1_crop_recommendation.pkl")
        bundle = joblib.load(path)
        self.model = bundle["model"]
        self.features = bundle["features"]

    def predict(self, N, P, K, temperature, humidity, ph, rainfall):
        X = pd.DataFrame([{
            "N": N, "P": P, "K": K, "temperature": temperature,
            "humidity": humidity, "ph": ph, "rainfall": rainfall,
        }])[self.features]
        pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        top3_idx = proba.argsort()[-3:][::-1]
        top3 = [
            {"crop": self.model.classes_[i], "confidence": round(float(proba[i]), 4)}
            for i in top3_idx
        ]
        return {"recommended_crop": pred, "confidence": round(float(proba.max()), 4), "top_3": top3}


class SoilQualityModel:
    """Model 2 (v2): Maize-only binary fertility flag from Temperature, Humidity,
    Moisture, Soil Type. See ml_api/ml_models/README_SOIL_QUALITY.md for full context."""

    def __init__(self, path=None):
        path = path or os.path.join(ML_MODELS_DIR, "model2_maize_soil_quality.pkl")
        bundle = joblib.load(path)
        self.model = bundle["model"]
        self.features = bundle["features"]
        self.soil_types = bundle["soil_types"]
        self.crop_scope = bundle.get("crop_scope", "Maize")

    def predict(self, temperature, humidity, moisture, soil_type):
        if soil_type not in self.soil_types:
            raise ValueError(f"soil_type must be one of {self.soil_types}, got '{soil_type}'")
        row = {"Temparature": temperature, "Humidity": humidity, "Moisture": moisture}
        for s in self.soil_types:
            row[f"soil_{s}"] = 1 if s == soil_type else 0
        X = pd.DataFrame([row])[self.features]
        pred = self.model.predict(X)[0]
        proba = self.model.predict_proba(X)[0]
        proba_map = {cls: round(float(p), 4) for cls, p in zip(self.model.classes_, proba)}
        return {
            "crop_scope": self.crop_scope,
            "fertility_flag": pred,
            "confidence": round(float(max(proba)), 4),
            "probabilities": proba_map,
            "advisory": (
                "Below-median fertility signal - consider a soil test for this zone."
                if pred == "Low" else
                "Above-median fertility signal - no immediate soil-test flag."
            ),
        }


class PrecisionIrrigationModel:
    """Model 3: soil_moisture, humidity, temperature -> predicted water required (L).
    NOTE: trained on an engineered proxy target - see the main project report before
    using this to drive real actuators."""

    def __init__(self, path=None):
        path = path or os.path.join(ML_MODELS_DIR, "model3_precision_irrigation.pkl")
        bundle = joblib.load(path)
        self.model = bundle["model"]
        self.features = bundle["features"]

    def predict(self, soil_moisture, humidity, temperature):
        X = pd.DataFrame([{
            "soil_moisture": soil_moisture, "humidity": humidity, "temperature": temperature,
        }])[self.features]
        liters = float(self.model.predict(X)[0])
        return {
            "water_required_liters": round(liters, 2),
            "caveat": "Trained on an engineered proxy target pending real flow-meter data.",
        }


# ---------------- Singletons: loaded once at Django process startup ----------------
crop_recommendation_model = CropRecommendationModel()
soil_quality_model = SoilQualityModel()
precision_irrigation_model = PrecisionIrrigationModel()
