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

        const healthyPercentage = Math.round(
            (healthyCount / cropHealthData.length) * 100
        );

        const monitorPercentage = Math.round(
            (monitorCount / cropHealthData.length) * 100
        );

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