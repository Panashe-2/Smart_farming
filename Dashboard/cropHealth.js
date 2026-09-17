
// FARMSENSE CROP HEALTH PAGE
// Temporary data until the ML model is ready


// Get elements from the Crop Health page
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

// Display the selected image's filename
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


// UPDATE TEMPORARY HEALTH DATA


function updateHealthData() {
    // Temporary values for testing the dashboard
    const newHealthyValue = randomNumber(80, 92);
    const newMonitorValue = 100 - newHealthyValue;

    healthyAreas.textContent =
        newHealthyValue + "%";

    areasToMonitor.textContent =
        newMonitorValue + "%";

    updateHealthTime();
}

// Generate a random whole number
function randomNumber(minimum, maximum) {
    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
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

// Display the current time when the page opens
updateHealthTime();

// Update temporary health data every ten seconds
setInterval(updateHealthData, 10000);