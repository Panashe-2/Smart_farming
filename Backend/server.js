
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// SAMPLE FIELD DATA
// ==========================================

const fields = [
    {
        id: 1,
        name: "North Corn Field",
        crop: "Corn",
        area: 45,
        soilMoisture: 68,
        temperature: 24.6,
        status: "Healthy"
    },
    {
        id: 2,
        name: "Eastern Corn Field",
        crop: "Corn",
        area: 38,
        soilMoisture: 54,
        temperature: 27.2,
        status: "Monitor"
    },
    {
        id: 3,
        name: "Southern Corn Field",
        crop: "Corn",
        area: 29,
        soilMoisture: 71,
        temperature: 23.9,
        status: "Healthy"
    }
];

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FarmSense backend is running"
    });
});

// ==========================================
// GET ALL FIELDS
// ==========================================

app.get("/api/fields", (req, res) => {
    res.json({
        success: true,
        count: fields.length,
        data: fields
    });
});

// ==========================================
// GET SINGLE FIELD
// ==========================================

app.get("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);

    const field = fields.find(
        (item) => item.id === fieldId
    );

    if (!field) {
        return res.status(404).json({
            success: false,
            message: "Field not found"
        });
    }

    return res.json({
        success: true,
        data: field
    });
});

// ==========================================
// DASHBOARD SUMMARY
// ==========================================

app.get("/api/dashboard", (req, res) => {
    const totalArea = fields.reduce(
        (total, field) => total + field.area,
        0
    );

    const healthyFields = fields.filter(
        (field) => field.status === "Healthy"
    ).length;

    return res.json({
        success: true,
        data: {
            totalFields: fields.length,
            totalArea: totalArea,
            healthyFields: healthyFields
        }
    });
});

// ==========================================
// ADD NEW FIELD
// ==========================================

app.post("/api/fields", (req, res) => {
    const {
        name,
        crop,
        area,
        soilMoisture,
        temperature,
        status
    } = req.body || {};

    const fieldName =
        typeof name === "string"
            ? name.trim()
            : "";

    const cropName =
        typeof crop === "string"
            ? crop.trim()
            : "";

    const fieldArea = Number(area);

    // Check required information
    if (
        !fieldName ||
        !cropName ||
        area === undefined ||
        area === null ||
        area === ""
    ) {
        return res.status(400).json({
            success: false,
            message: "Name, crop and area are required."
        });
    }

    // Validate field area
    if (
        !Number.isFinite(fieldArea) ||
        fieldArea <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Area must be greater than zero."
        });
    }

    // Optional soil moisture
    const moisture =
        soilMoisture === undefined ||
        soilMoisture === null ||
        soilMoisture === ""
            ? 0
            : Number(soilMoisture);

    // Optional temperature
    const temp =
        temperature === undefined ||
        temperature === null ||
        temperature === ""
            ? 0
            : Number(temperature);

    // Validate soil moisture
    if (
        !Number.isFinite(moisture) ||
        moisture < 0 ||
        moisture > 100
    ) {
        return res.status(400).json({
            success: false,
            message: "Soil moisture must be between 0 and 100."
        });
    }

    // Validate temperature
    if (!Number.isFinite(temp)) {
        return res.status(400).json({
            success: false,
            message: "Temperature must be a valid number."
        });
    }

    // Create field object
    const newField = {
        id: fields.length
            ? Math.max(
                ...fields.map((field) => field.id)
            ) + 1
            : 1,
        name: fieldName,
        crop: cropName,
        area: fieldArea,
        soilMoisture: moisture,
        temperature: temp,
        status: status || "Healthy"
    };

    // Temporary storage until Supabase
    // farmer ownership and RLS are ready.
    fields.push(newField);

    return res.status(201).json({
        success: true,
        message: "Field created in demo data.",
        data: newField
    });
});

// ==========================================
// UPDATE FIELD
// ==========================================

app.put("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);

    const field = fields.find(
        (item) => item.id === fieldId
    );

    if (!field) {
        return res.status(404).json({
            success: false,
            message: "Field not found"
        });
    }

    const {
        name,
        crop,
        area,
        soilMoisture,
        temperature,
        status
    } = req.body || {};

    const updates = {};

    // Update field name
    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name must not be empty."
            });
        }

        updates.name = name.trim();
    }

    // Update crop
    if (crop !== undefined) {
        if (
            typeof crop !== "string" ||
            !crop.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Crop must not be empty."
            });
        }

        updates.crop = crop.trim();
    }

    // Update area
    if (area !== undefined) {
        if (
            area === null ||
            area === "" ||
            !Number.isFinite(Number(area)) ||
            Number(area) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Area must be greater than zero."
            });
        }

        updates.area = Number(area);
    }

    // Update soil moisture
    if (soilMoisture !== undefined) {
        const moisture = Number(soilMoisture);

        if (
            soilMoisture === null ||
            soilMoisture === "" ||
            !Number.isFinite(moisture) ||
            moisture < 0 ||
            moisture > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Soil moisture must be between 0 and 100."
            });
        }

        updates.soilMoisture = moisture;
    }

    // Update temperature
    if (temperature !== undefined) {
        const temp = Number(temperature);

        if (
            temperature === null ||
            temperature === "" ||
            !Number.isFinite(temp)
        ) {
            return res.status(400).json({
                success: false,
                message: "Temperature must be a valid number."
            });
        }

        updates.temperature = temp;
    }

    // Update status
    if (status !== undefined) {
        if (
            typeof status !== "string" ||
            !status.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Status must not be empty."
            });
        }

        updates.status = status.trim();
    }

    // Apply validated changes
    Object.assign(field, updates);

    return res.json({
        success: true,
        message: "Field updated successfully",
        data: field
    });
});

// ==========================================
// DELETE FIELD
// ==========================================

app.delete("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);

    const fieldIndex = fields.findIndex(
        (item) => item.id === fieldId
    );

    if (fieldIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Field not found"
        });
    }

    const deletedField = fields.splice(
        fieldIndex,
        1
    )[0];

    return res.json({
        success: true,
        message: "Field deleted successfully",
        data: deletedField
    });
});

// ==========================================
// SAMPLE IRRIGATION DATA
// ==========================================

const irrigationRecords = [
    {
        id: 1,
        fieldId: 1,
        fieldName: "North Corn Field",
        soilMoisture: 68,
        irrigationStatus: "Not required",
        nextSchedule: "2026-10-07 06:00",
        waterUsedLitres: 0
    },
    {
        id: 2,
        fieldId: 2,
        fieldName: "Eastern Corn Field",
        soilMoisture: 54,
        irrigationStatus: "Scheduled",
        nextSchedule: "2026-10-06 06:00",
        waterUsedLitres: 1200
    },
    {
        id: 3,
        fieldId: 3,
        fieldName: "Southern Corn Field",
        soilMoisture: 71,
        irrigationStatus: "Not required",
        nextSchedule: "2026-10-08 06:00",
        waterUsedLitres: 0
    }
];

// ==========================================
// SAMPLE WEATHER DATA
// ==========================================

const weatherData = {
    location: "Cape Town",
    condition: "Partly cloudy",
    temperature: 24,
    humidity: 63,
    windSpeed: 18,
    rainfallChance: 20,
    forecast: [
        {
            day: "Monday",
            minimumTemperature: 16,
            maximumTemperature: 24,
            condition: "Partly cloudy"
        },
        {
            day: "Tuesday",
            minimumTemperature: 15,
            maximumTemperature: 22,
            condition: "Light rain"
        },
        {
            day: "Wednesday",
            minimumTemperature: 17,
            maximumTemperature: 26,
            condition: "Sunny"
        }
    ]
};

// ==========================================
// CROP HEALTH
// ==========================================

app.get("/api/crop-health", (req, res) => {
    const cropHealth = fields.map((field) => ({
        fieldId: field.id,
        fieldName: field.name,
        crop: field.crop,
        healthStatus: field.status,
        soilMoisture: field.soilMoisture,
        temperature: field.temperature,
        recommendation:
            field.status === "Healthy"
                ? "Continue normal monitoring"
                : "Inspect the field and monitor moisture levels"
    }));

    return res.json({
        success: true,
        count: cropHealth.length,
        data: cropHealth
    });
});

// ==========================================
// IRRIGATION
// ==========================================

app.get("/api/irrigation", (req, res) => {
    return res.json({
        success: true,
        count: irrigationRecords.length,
        data: irrigationRecords
    });
});

// ==========================================
// WEATHER
// ==========================================

app.get("/api/weather", (req, res) => {
    return res.json({
        success: true,
        data: weatherData
    });
});

// ==========================================
// REPORTS
// ==========================================

app.get("/api/reports", (req, res) => {
    const totalArea = fields.reduce(
        (total, field) => total + field.area,
        0
    );

    const healthyFields = fields.filter(
        (field) => field.status === "Healthy"
    ).length;

    const fieldsNeedingAttention = fields.filter(
        (field) => field.status !== "Healthy"
    ).length;

    // Avoid dividing by zero when no fields exist
    const averageSoilMoisture = fields.length
        ? fields.reduce(
            (total, field) =>
                total + field.soilMoisture,
            0
        ) / fields.length
        : 0;

    const totalWaterUsed = irrigationRecords.reduce(
        (total, record) =>
            total + record.waterUsedLitres,
        0
    );

    return res.json({
        success: true,
        data: {
            totalFields: fields.length,
            totalArea,
            healthyFields,
            fieldsNeedingAttention,
            averageSoilMoisture: Number(
                averageSoilMoisture.toFixed(1)
            ),
            totalWaterUsed
        }
    });
});

// ==========================================
// DJANGO MACHINE LEARNING SERVICE
// ==========================================

const ML_API_URL =
    process.env.ML_API_URL ||
    "http://127.0.0.1:8000";

async function forwardToMlService(
    req,
    res,
    endpoint
) {
    try {
        const mlResponse = await fetch(
            `${ML_API_URL}${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        const result = await mlResponse.json();

        return res
            .status(mlResponse.status)
            .json(result);

    } catch (error) {
        console.error(
            "ML service error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message:
                "The ML prediction service is unavailable."
        });
    }
}

// ==========================================
// ML MODEL 1: CROP RECOMMENDATION
// ==========================================

app.post("/api/ml/crop", async (req, res) => {
    return forwardToMlService(
        req,
        res,
        "/api/crop/"
    );
});

// ==========================================
// ML MODEL 2: SOIL QUALITY
// ==========================================

app.post("/api/ml/soil", async (req, res) => {
    return forwardToMlService(
        req,
        res,
        "/api/soil/"
    );
});

// ==========================================
// ML MODEL 3: PRECISION IRRIGATION
// ==========================================

app.post("/api/ml/irrigation", async (req, res) => {
    return forwardToMlService(
        req,
        res,
        "/api/irrigate/"
    );
});

// ==========================================
// ML MODEL 4: MAIZE SUITABILITY
// ==========================================

app.post(
    "/api/ml/maize-suitability",
    async (req, res) => {
        return forwardToMlService(
            req,
            res,
            "/api/maize-suitability/"
        );
    }
);

// ==========================================
// START BACKEND SERVER
// ==========================================

const server = app.listen(PORT, () => {
    console.log(
        `FarmSense server running on http://localhost:${PORT}`
    );
});

server.on("error", (error) => {
    console.error("Server error:", error);
});

server.on("close", () => {
    console.log("The Node server was closed.");
});
