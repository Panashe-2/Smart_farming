
// FARMSENSE IRRIGATION PAGE
// Temporary controls until backend connection


// Get page elements
const startButton =
    document.getElementById("startButton");

const pauseButton =
    document.getElementById("pauseButton");

const stopButton =
    document.getElementById("stopButton");

const systemStatus =
    document.getElementById("systemStatus");

const activeSystems =
    document.getElementById("activeSystems");

const irrigationProgressBar =
    document.getElementById("irrigationProgressBar");

const irrigationProgressText =
    document.getElementById("irrigationProgressText");

const currentMoisture =
    document.getElementById("currentMoisture");

const targetMoisture =
    document.getElementById("targetMoisture");

const irrigationField =
    document.getElementById("irrigationField");

const selectedFieldName =
    document.getElementById("selectedFieldName");

const irrigationSettingsForm =
    document.getElementById("irrigationSettingsForm");

const targetMoistureInput =
    document.getElementById("targetMoistureInput");

const settingsMessage =
    document.getElementById("settingsMessage");

const addScheduleButton =
    document.getElementById("addScheduleButton");

const scheduleTableBody =
    document.getElementById("scheduleTableBody");

const irrigationLastUpdated =
    document.getElementById("irrigationLastUpdated");

const logoutButton =
    document.getElementById("logoutButton");

// Temporary irrigation state
let irrigationRunning = true;
let irrigationProgress = 72;
let moistureLevel = 68;


// START IRRIGATION


startButton.addEventListener("click", function () {
    irrigationRunning = true;

    systemStatus.textContent = "Running";
    activeSystems.textContent = "1";

    updateLastUpdatedTime();
});


// PAUSE IRRIGATION


pauseButton.addEventListener("click", function () {
    irrigationRunning = false;

    systemStatus.textContent = "Paused";
    activeSystems.textContent = "0";

    updateLastUpdatedTime();
});


// STOP IRRIGATION


stopButton.addEventListener("click", function () {
    const shouldStop = confirm(
        "Are you sure you want to stop irrigation?"
    );

    if (!shouldStop) {
        return;
    }

    irrigationRunning = false;
    irrigationProgress = 0;

    systemStatus.textContent = "Stopped";
    activeSystems.textContent = "0";

    updateProgressDisplay();
    updateLastUpdatedTime();
});


// UPDATE IRRIGATION PROGRESS


function updateIrrigation() {
    if (!irrigationRunning) {
        return;
    }

    if (irrigationProgress < 100) {
        irrigationProgress++;
    }

    if (moistureLevel < 75) {
        moistureLevel++;
    }

    if (
        irrigationProgress >= 100 ||
        moistureLevel >= 75
    ) {
        irrigationProgress = 100;
        irrigationRunning = false;

        systemStatus.textContent = "Completed";
        activeSystems.textContent = "0";
    }

    updateProgressDisplay();
    updateLastUpdatedTime();
}

function updateProgressDisplay() {
    irrigationProgressBar.style.width =
        irrigationProgress + "%";

    irrigationProgressText.textContent =
        irrigationProgress + "%";

    currentMoisture.textContent =
        moistureLevel + "%";
}


// CHANGE SELECTED FIELD


irrigationField.addEventListener("change", function () {
    selectedFieldName.textContent =
        irrigationField.value;

    irrigationProgress = 0;
    moistureLevel = 58;
    irrigationRunning = false;

    systemStatus.textContent = "Ready";
    activeSystems.textContent = "0";

    updateProgressDisplay();
    updateLastUpdatedTime();
});


// SAVE IRRIGATION SETTINGS


irrigationSettingsForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const threshold =
            Number(
                document.getElementById(
                    "moistureThreshold"
                ).value
            );

        const newTarget =
            Number(targetMoistureInput.value);

        const duration =
            Number(
                document.getElementById(
                    "maximumDuration"
                ).value
            );

        if (
            threshold < 0 ||
            threshold > 100 ||
            newTarget < 0 ||
            newTarget > 100 ||
            duration <= 0
        ) {
            settingsMessage.textContent =
                "Please enter valid irrigation settings.";

            return;
        }

        if (threshold >= newTarget) {
            settingsMessage.textContent =
                "The target must be higher than the starting level.";

            return;
        }

        targetMoisture.textContent =
            newTarget + "%";

        settingsMessage.textContent =
            "Irrigation settings saved.";

        updateLastUpdatedTime();
    }
);


// ADD IRRIGATION SCHEDULE


addScheduleButton.addEventListener("click", function () {
    const fieldName = prompt(
        "Enter the field name:"
    );

    if (
        fieldName === null ||
        fieldName.trim() === ""
    ) {
        return;
    }

    const startTime = prompt(
        "Enter the start time, for example 06:00:"
    );

    if (
        startTime === null ||
        startTime.trim() === ""
    ) {
        return;
    }

    const duration = prompt(
        "Enter the duration in minutes:"
    );

    if (
        duration === null ||
        duration.trim() === "" ||
        isNaN(duration) ||
        Number(duration) <= 0
    ) {
        alert("Please enter a valid duration.");
        return;
    }

    const newRow =
        document.createElement("tr");

    newRow.innerHTML = `
        <td>${fieldName}</td>
        <td>${startTime}</td>
        <td>${duration} minutes</td>
        <td>
            <span class="schedule-status scheduled">
                Scheduled
            </span>
        </td>
    `;

    scheduleTableBody.appendChild(newRow);

    updateLastUpdatedTime();
});


// UPDATE TIME


function updateLastUpdatedTime() {
    const currentTime = new Date();

    irrigationLastUpdated.textContent =
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

// Display initial values
updateProgressDisplay();
updateLastUpdatedTime();

// Temporarily update irrigation every three seconds
setInterval(updateIrrigation, 3000);