from rest_framework import serializers
from .models import SensorReading, Prediction, CropRecord


# ---------------- Request serializers (validate incoming POST bodies) ----------------

class CropRecommendationRequestSerializer(serializers.Serializer):
    zone_id = serializers.CharField(max_length=50)
    N = serializers.FloatField(min_value=0)
    P = serializers.FloatField(min_value=0)
    K = serializers.FloatField(min_value=0)
    temperature = serializers.FloatField()
    humidity = serializers.FloatField(min_value=0, max_value=100)
    ph = serializers.FloatField(min_value=0, max_value=14)
    rainfall = serializers.FloatField(min_value=0)


class SoilQualityRequestSerializer(serializers.Serializer):
    zone_id = serializers.CharField(max_length=50)
    temperature = serializers.FloatField()
    humidity = serializers.FloatField(min_value=0, max_value=100)
    moisture = serializers.FloatField(min_value=0, max_value=100)
    soil_type = serializers.ChoiceField(choices=["Black", "Clayey", "Loamy", "Red", "Sandy"])


class IrrigationRequestSerializer(serializers.Serializer):
    zone_id = serializers.CharField(max_length=50)
    soil_moisture = serializers.FloatField(min_value=0, max_value=100)
    humidity = serializers.FloatField(min_value=0, max_value=100)
    temperature = serializers.FloatField()


# ---------------- Model serializers (for listing stored records) ----------------

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = "__all__"


class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = "__all__"


class CropRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropRecord
        fields = "__all__"
