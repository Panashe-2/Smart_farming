const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FarmSense backend is running"
    });
});

app.get("/api/fields", (req, res) => {
    res.json({
        success: true,
        count: fields.length,
        data: fields
    });
});

app.get("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);
    const field = fields.find((item) => item.id === fieldId);

    if (!field) {
        return res.status(404).json({
            success: false,
            message: "Field not found"
        });
    }

    res.json({
        success: true,
        data: field
    });
});
app.get("/api/dashboard", (req, res) => {
    const totalArea = fields.reduce((total, field) => {
        return total + field.area;
    }, 0);

    const healthyFields = fields.filter((field) => {
        return field.status === "Healthy";
    }).length;

    res.json({
        success: true,
        data: {
            totalFields: fields.length,
            totalArea: totalArea,
            healthyFields: healthyFields
        }
    });
});app.post("/api/fields", (req, res) => {
    const {
        name,
        crop,
        area,
        soilMoisture,
        temperature,
        status
    } = req.body;

    if (!name || !crop || !area) {
        return res.status(400).json({
            success: false,
            message: "Name, crop and area are required"
        });
    }

    const newField = {
        id: fields.length
            ? Math.max(...fields.map((field) => field.id)) + 1
            : 1,
        name,
        crop,
        area: Number(area),
        soilMoisture: Number(soilMoisture) || 0,
        temperature: Number(temperature) || 0,
        status: status || "Healthy"
    };

    fields.push(newField);

    res.status(201).json({
        success: true,
        message: "Field created successfully",
        data: newField
    });
});

app.put("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);
    const field = fields.find((item) => item.id === fieldId);

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
    } = req.body;

    if (name !== undefined) field.name = name;
    if (crop !== undefined) field.crop = crop;
    if (area !== undefined) field.area = Number(area);
    if (soilMoisture !== undefined) {
        field.soilMoisture = Number(soilMoisture);
    }
    if (temperature !== undefined) {
        field.temperature = Number(temperature);
    }
    if (status !== undefined) field.status = status;

    res.json({
        success: true,
        message: "Field updated successfully",
        data: field
    });
});

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

    const deletedField = fields.splice(fieldIndex, 1)[0];

    res.json({
        success: true,
        message: "Field deleted successfully",
        data: deletedField
    });
});app.post("/api/fields", (req, res) => {
    const {
        name,
        crop,
        area,
        soilMoisture,
        temperature,
        status
    } = req.body;

    if (!name || !crop || !area) {
        return res.status(400).json({
            success: false,
            message: "Name, crop and area are required"
        });
    }

    const newField = {
        id: fields.length
            ? Math.max(...fields.map((field) => field.id)) + 1
            : 1,
        name,
        crop,
        area: Number(area),
        soilMoisture: Number(soilMoisture) || 0,
        temperature: Number(temperature) || 0,
        status: status || "Healthy"
    };

    fields.push(newField);

    res.status(201).json({
        success: true,
        message: "Field created successfully",
        data: newField
    });
});

app.put("/api/fields/:id", (req, res) => {
    const fieldId = Number(req.params.id);
    const field = fields.find((item) => item.id === fieldId);

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
    } = req.body;

    if (name !== undefined) field.name = name;
    if (crop !== undefined) field.crop = crop;
    if (area !== undefined) field.area = Number(area);
    if (soilMoisture !== undefined) {
        field.soilMoisture = Number(soilMoisture);
    }
    if (temperature !== undefined) {
        field.temperature = Number(temperature);
    }
    if (status !== undefined) field.status = status;

    res.json({
        success: true,
        message: "Field updated successfully",
        data: field
    });
});

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

    const deletedField = fields.splice(fieldIndex, 1)[0];

    res.json({
        success: true,
        message: "Field deleted successfully",
        data: deletedField
    });
});const irrigationRecords = [
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

    res.json({
        success: true,
        count: cropHealth.length,
        data: cropHealth
    });
});

app.get("/api/irrigation", (req, res) => {
    res.json({
        success: true,
        count: irrigationRecords.length,
        data: irrigationRecords
    });
});

app.get("/api/weather", (req, res) => {
    res.json({
        success: true,
        data: weatherData
    });
});

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

    const averageSoilMoisture =
        fields.reduce(
            (total, field) => total + field.soilMoisture,
            0
        ) / fields.length;

    const totalWaterUsed = irrigationRecords.reduce(
        (total, record) => total + record.waterUsedLitres,
        0
    );

    res.json({
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
app.listen(PORT, () => {
    console.log(`FarmSense server running on http://localhost:${PORT}`);
});