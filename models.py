from django.db import models


class SensorReading(models.Model):
    """Raw sensor reading from a field zone. Populated by the MQTT consumer (or the
    sensor simulator during development) every ~15 minutes per the proposal's
    Communication Layer spec."""
    zone_id = models.CharField(max_length=50, db_index=True)
    crop_id = models.CharField(max_length=50, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    soil_moisture = models.FloatField(help_text="Percent")
    temperature = models.FloatField(help_text="Degrees C")
    humidity = models.FloatField(help_text="Percent")
    soil_ph = models.FloatField(null=True, blank=True)
    soil_type = models.CharField(
        max_length=20,
        choices=[(s, s) for s in ["Black", "Clayey", "Loamy", "Red", "Sandy"]],
        null=True, blank=True,
    )
    nitrogen = models.FloatField(null=True, blank=True)
    phosphorous = models.FloatField(null=True, blank=True)
    potassium = models.FloatField(null=True, blank=True)
    rainfall = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.zone_id} @ {self.timestamp:%Y-%m-%d %H:%M}"


class Prediction(models.Model):
    """Every ML prediction served, logged for the Prediction History panel and for
    the Model Accuracy Tracker once real outcomes come in."""
    MODEL_CHOICES = [
        ("crop_recommendation", "Crop Recommendation"),
        ("soil_quality", "Soil Quality (Maize)"),
        ("precision_irrigation", "Precision Irrigation"),
    ]
    model_name = models.CharField(max_length=30, choices=MODEL_CHOICES)
    zone_id = models.CharField(max_length=50, db_index=True)
    input_payload = models.JSONField()
    output = models.JSONField()
    confidence = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.model_name} -> {self.output} ({self.created_at:%Y-%m-%d %H:%M})"


class CropRecord(models.Model):
    """Crop lifecycle tracking: planting through outcome. This is exactly the table
    that will eventually supply real training data for Model 2/3 retraining."""
    STATUS_CHOICES = [("growing", "Growing"), ("failed", "Failed/Died"), ("harvested", "Harvested")]

    zone_id = models.CharField(max_length=50, db_index=True)
    crop_type = models.CharField(max_length=50, default="Maize")
    planting_date = models.DateField()
    expected_harvest_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="growing")

    failure_cause = models.CharField(max_length=100, null=True, blank=True)
    predicted_yield_kg = models.FloatField(null=True, blank=True)
    actual_yield_kg = models.FloatField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.crop_type} @ {self.zone_id} ({self.status})"
