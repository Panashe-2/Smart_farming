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
});
app.listen(PORT, () => {
    console.log(`FarmSense server running on http://localhost:${PORT}`);
});