from django.urls import path
from . import views

urlpatterns = [
    path("crop/", views.CropRecommendationView.as_view(), name="crop-recommendation"),
    path("soil/", views.SoilQualityView.as_view(), name="soil-quality"),
    path("irrigate/", views.IrrigationView.as_view(), name="precision-irrigation"),

    path("sensor-readings/", views.SensorReadingListCreateView.as_view(), name="sensor-readings"),
    path("predictions/", views.PredictionListView.as_view(), name="predictions"),
    path("crop-records/", views.CropRecordListCreateView.as_view(), name="crop-records"),
    path("crop-records/<int:pk>/", views.CropRecordDetailView.as_view(), name="crop-record-detail"),
]
