from django.contrib import admin
from .models import SensorReading, Prediction, CropRecord


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ("zone_id", "crop_id", "timestamp", "soil_moisture", "temperature", "humidity")
    list_filter = ("zone_id", "crop_id")


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("model_name", "zone_id", "confidence", "created_at")
    list_filter = ("model_name",)


@admin.register(CropRecord)
class CropRecordAdmin(admin.ModelAdmin):
    list_display = ("crop_type", "zone_id", "status", "planting_date")
    list_filter = ("status", "crop_type")
