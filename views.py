from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics

from .ml_inference import crop_recommendation_model, soil_quality_model, precision_irrigation_model
from .serializers import (
    CropRecommendationRequestSerializer, SoilQualityRequestSerializer, IrrigationRequestSerializer,
    SensorReadingSerializer, PredictionSerializer, CropRecordSerializer,
)
from .models import SensorReading, Prediction, CropRecord


class CropRecommendationView(APIView):
    """POST /api/crop/  ->  Model 1: recommended crop from soil nutrients + climate."""

    def post(self, request):
        serializer = CropRecommendationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = crop_recommendation_model.predict(
            N=data["N"], P=data["P"], K=data["K"],
            temperature=data["temperature"], humidity=data["humidity"],
            ph=data["ph"], rainfall=data["rainfall"],
        )

        Prediction.objects.create(
            model_name="crop_recommendation",
            zone_id=data["zone_id"],
            input_payload=data,
            output=result,
            confidence=result["confidence"],
        )
        return Response(result, status=status.HTTP_200_OK)


class SoilQualityView(APIView):
    """POST /api/soil/  ->  Model 2: maize soil fertility flag (High/Low) from cheap sensors.

    Reminder from the report: 56.8% CV accuracy vs a 50.5% baseline - treat the output
    as an advisory "worth a soil test" flag, not a precise fertility reading.
    """

    def post(self, request):
        serializer = SoilQualityRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            result = soil_quality_model.predict(
                temperature=data["temperature"], humidity=data["humidity"],
                moisture=data["moisture"], soil_type=data["soil_type"],
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        Prediction.objects.create(
            model_name="soil_quality",
            zone_id=data["zone_id"],
            input_payload=data,
            output=result,
            confidence=result["confidence"],
        )
        return Response(result, status=status.HTTP_200_OK)


class IrrigationView(APIView):
    """POST /api/irrigate/  ->  Model 3: predicted water required (L) from soil
    moisture, humidity, temperature.

    Reminder from the report: trained on an engineered proxy target, not measured
    litres - do not wire this directly to pump/valve actuators until retrained on
    real flow-meter data.
    """

    def post(self, request):
        serializer = IrrigationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        result = precision_irrigation_model.predict(
            soil_moisture=data["soil_moisture"], humidity=data["humidity"],
            temperature=data["temperature"],
        )

        Prediction.objects.create(
            model_name="precision_irrigation",
            zone_id=data["zone_id"],
            input_payload=data,
            output=result,
        )
        return Response(result, status=status.HTTP_200_OK)


# ---------------- Supporting read endpoints for the dashboard ----------------

class SensorReadingListCreateView(generics.ListCreateAPIView):
    """GET /api/sensor-readings/  -> list, for the dashboard's sensor graphs.
    POST /api/sensor-readings/  -> used by the sensor simulator / MQTT consumer."""
    queryset = SensorReading.objects.all()[:500]
    serializer_class = SensorReadingSerializer


class PredictionListView(generics.ListAPIView):
    """GET /api/predictions/  -> Prediction History panel."""
    queryset = Prediction.objects.all()[:500]
    serializer_class = PredictionSerializer


class CropRecordListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/crop-records/  -> Crop Lifecycle Tracking panel."""
    queryset = CropRecord.objects.all()
    serializer_class = CropRecordSerializer


class CropRecordDetailView(generics.RetrieveUpdateAPIView):
    """PATCH /api/crop-records/<id>/  -> update status/outcome as a crop grows, fails, or is harvested."""
    queryset = CropRecord.objects.all()
    serializer_class = CropRecordSerializer
