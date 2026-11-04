// FARMSENSE CROP HEALTH PAGE

const API_URL = "http://localhost:3000/api";

const uploadCropButton =
    document.getElementById("uploadCropButton");

const cropImageInput =
    document.getElementById("cropImageInput");

const selectedImageName =
    document.getElementById("selectedImageName");

const healthFieldFilter =
    document.getElementById("healthFieldFilter");

const healthLastUpdated =
    document.getElementById("healthLastUpdated");

const healthyAreas =
    document.getElementById("healthyAreas");

const areasToMonitor =
    document.getElementById("areasToMonitor");

const logoutButton =
    document.getElementById("logoutButton");


// SELECT A CROP IMAGE

uploadCropButton.addEventListener("click", function () {
    cropImageInput.click();
});

cropImageInput.addEventListener("change", function () {
    const selectedFile = cropImageInput.files[0];

    if (!selectedFile) {
        selectedImageName.textContent =
            "No image selected";

        return;
    }

    selectedImageName.textContent =
        "Selected image: " + selectedFile.name;

    alert(
        "The image was selected successfully. " +
        "Analysis will be available after the " +
        "machine-learning model is connected."
    );
});


// FILTER FIELD HEALTH INFORMATION

healthFieldFilter.addEventListener("change", function () {
    const selectedField = healthFieldFilter.value;

    const fieldItems =
        document.querySelectorAll(".health-field-item");

    fieldItems.forEach(function (fieldItem) {
        const fieldName = fieldItem.dataset.field;

        if (
            selectedField === "all" ||
            selectedField === fieldName
        ) {
            fieldItem.style.display = "block";
        } else {
            fieldItem.style.display = "none";
        }
    });
});


// LOAD CROP HEALTH DATA FROM THE BACKEND

async function loadCropHealthData() {
    try {
        const response = await fetch(
            `${API_URL}/crop-health`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load crop-health data"
            );
        }

        const result = await response.json();
        const cropHealthData = result.data;

        const healthyCount = cropHealthData.filter(
            (field) => field.healthStatus === "Healthy"
        ).length;

        const monitorCount =
            cropHealthData.length - healthyCount;

        
const totalFields = cropHealthData.length;

const healthyPercentage = totalFields > 0
    ? Math.round((healthyCount / totalFields) * 100)
    : 0;

const monitorPercentage = totalFields > 0
    ? Math.round((monitorCount / totalFields) * 100)
    : 0;


        healthyAreas.textContent =
            healthyPercentage + "%";

        areasToMonitor.textContent =
            monitorPercentage + "%";

        updateHealthTime();
    } catch (error) {
        console.error(error);

        healthyAreas.textContent = "Unavailable";
        areasToMonitor.textContent = "Unavailable";

        alert(
            "Crop-health data could not be loaded. " +
            "Make sure the backend server is running."
        );
    }
}


// UPDATE LAST UPDATED TIME

function updateHealthTime() {
    const currentTime = new Date();

    healthLastUpdated.textContent =
        currentTime.toLocaleString();
}


// LOG OUT

logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});


// LOAD DATA WHEN THE PAGE OPENS

loadCropHealthData();

// Refresh backend data every 30 seconds
setInterval(loadCropHealthData, 30000);

 // CROP RECOMMENDATION MACHINE LEARNING

const cropRecommendationForm =
    document.getElementById("cropRecommendationForm");

const cropPredictionResult =
    document.getElementById("cropPredictionResult");

cropRecommendationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    cropPredictionResult.textContent =
        "Analysing farming measurements...";

    const formData = new FormData(cropRecommendationForm);

    const cropData = {
        zone_id: "field-01",
        N: Number(formData.get("N")),
        P: Number(formData.get("P")),
        K: Number(formData.get("K")),
        temperature: Number(formData.get("temperature")),
        humidity: Number(formData.get("humidity")),
        ph: Number(formData.get("ph")),
        rainfall: Number(formData.get("rainfall"))
    };

    try {
        const response = await fetch(`${API_URL}/ml/crop`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cropData)
        });

        if (!response.ok) {
            throw new Error("Crop prediction failed.");
        }

        const result = await response.json();

        const confidence =
            (result.confidence * 100).toFixed(2);

        cropPredictionResult.textContent =
            "Recommended crop: " +
            result.recommended_crop +
            " | Confidence: " +
            confidence + "%";

    } catch (error) {
        console.error("Crop recommendation error:", error);

        cropPredictionResult.textContent =
            "Unable to generate a prediction. " +
            "Check that Node.js and Django are running.";
    }
});

 // MAIZE SOIL QUALITY PREDICTION

const soilQualityForm =
    document.getElementById("soilQualityForm");

const soilQualityResult =
    document.getElementById("soilQualityResult");

soilQualityForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    soilQualityResult.textContent = "Checking soil quality...";

    const formData = new FormData(soilQualityForm);

    const soilData = {
        zone_id: "field-01",
        temperature: Number(formData.get("temperature")),
        humidity: Number(formData.get("humidity")),
        moisture: Number(formData.get("moisture")),
        soil_type: formData.get("soil_type")
    };

    try {
        const response = await fetch(`${API_URL}/ml/soil`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(soilData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || result.message || "Prediction failed"
            );
        }

        soilQualityResult.textContent =
            "Maize soil fertility: " +
            result.fertility_flag +
            " | Confidence: " +
            (result.confidence * 100).toFixed(2) +
            "% | Advice: " +
            result.advisory;

    } catch (error) {
        console.error("Soil quality error:", error);

        soilQualityResult.textContent =
            "Unable to check soil quality: " + error.message;
    }
});
