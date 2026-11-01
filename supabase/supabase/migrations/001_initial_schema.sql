
-- Smart Farming: Initial Supabase database schema
-- Tables: farm_zones, sensor_readings, predictions,
-- crop_records, alerts, irrigation_logs

-- 1. Farm zones
CREATE TABLE public.farm_zones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_id TEXT NOT NULL UNIQUE,
    zone_name TEXT NOT NULL,
    soil_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Sensor readings
CREATE TABLE public.sensor_readings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_id TEXT NOT NULL,
    crop_id TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now(),
    soil_moisture DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    humidity DOUBLE PRECISION NOT NULL,
    soil_ph DOUBLE PRECISION,
    soil_type TEXT,
    nitrogen DOUBLE PRECISION,
    phosphorous DOUBLE PRECISION,
    potassium DOUBLE PRECISION,
    rainfall DOUBLE PRECISION
);

-- 3. Predictions
CREATE TABLE public.predictions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    model_name TEXT NOT NULL
        CHECK (model_name IN (
            'crop_recommendation',
            'soil_quality',
            'precision_irrigation'
        )),
    zone_id TEXT NOT NULL,
    input_payload JSONB NOT NULL,
    output JSONB NOT NULL,
    confidence DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Crop records
CREATE TABLE public.crop_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_id TEXT NOT NULL,
    crop_type TEXT NOT NULL DEFAULT 'Maize',
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    status TEXT NOT NULL DEFAULT 'growing'
        CHECK (status IN ('growing', 'failed', 'harvested')),
    failure_cause TEXT,
    predicted_yield_kg DOUBLE PRECISION,
    actual_yield_kg DOUBLE PRECISION,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Alerts
CREATE TABLE public.alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning'
        CHECK (severity IN ('info', 'warning', 'critical')),
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 6. Irrigation logs
CREATE TABLE public.irrigation_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_id TEXT NOT NULL,
    water_volume_litres DOUBLE PRECISION,
    pump_status TEXT NOT NULL DEFAULT 'off'
        CHECK (pump_status IN ('on', 'off')),
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.farm_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;

-- Django backend access policies
-- The farmsense_django role must already exist.

CREATE POLICY django_backend_access ON public.farm_zones
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);

CREATE POLICY django_backend_access ON public.sensor_readings
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);

CREATE POLICY django_backend_access ON public.predictions
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);

CREATE POLICY django_backend_access ON public.crop_records
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);

CREATE POLICY django_backend_access ON public.alerts
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);

CREATE POLICY django_backend_access ON public.irrigation_logs
    FOR ALL TO farmsense_django
    USING (true) WITH CHECK (true);
-- Grant Django backend table permissions
GRANT USAGE ON SCHEMA public TO farmsense_django;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO farmsense_django;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO farmsense_django;
