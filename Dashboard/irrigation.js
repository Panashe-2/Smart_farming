// FARMSENSE IRRIGATION PAGE

const IRRIGATION_API_URL =
    "http://localhost:3000/api/irrigation";


// GET PAGE ELEMENTS

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


// IRRIGATION STATE

let irrigationRunning = false;
let irrigationProgress = 0;
let moistureLevel = 0;
let irrigationRecords = [];


// LOAD IRRIGATION DATA FROM BACKEND

async function loadIrrigationData() {
    try {
        const response = await fetch(
            IRRIGATION_API_URL
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load irrigation data"
            );
        }

        const result = await response.json();

        irrigationRecords = result.data;

        displayFieldOptions();
        displayIrrigationSchedule();

        const firstRecord = irrigationRecords[0];

        if (firstRecord) {
            displaySelectedField(firstRecord);
        }

        const scheduledSystems =
            irrigationRecords.filter(
                function (record) {
                    return (
                        record.irrigationStatus ===
                        "Scheduled"
                    );
                }
            ).length;

        activeSystems.textContent =
            scheduledSystems;

        systemStatus.textContent =
            scheduledSystems > 0
                ? "Scheduled"
                : "Ready";

        updateLastUpdatedTime();
    } catch (error) {
        console.error(error);

        systemStatus.textContent =
            "Unavailable";

        activeSystems.textContent = "0";

        alert(
            "Irrigation data could not be loaded. " +
            "Make sure the backend server is running."
        );
    }
}


// DISPLAY FIELD OPTIONS

function displayFieldOptions() {
    irrigationField.innerHTML = "";

    irrigationRecords.forEach(function (record) {
        const option =
            document.createElement("option");

        option.value = record.fieldId;
        option.textContent = record.fieldName;

        irrigationField.appendChild(option);
    });
}


// DISPLAY IRRIGATION SCHEDULE

function displayIrrigationSchedule() {
    scheduleTableBody.innerHTML = "";

    irrigationRecords.forEach(function (record) {
        const newRow =
            document.createElement("tr");

        const statusClass =
            record.irrigationStatus === "Scheduled"
                ? "scheduled"
                : "completed";

        newRow.innerHTML = `
            <td>${record.fieldName}</td>
            <td>${record.nextSchedule}</td>
            <td>${record.waterUsedLitres} litres</td>
            <td>
                <span class="schedule-status ${statusClass}">
                    ${record.irrigationStatus}
                </span>
            </td>
        `;

        scheduleTableBody.appendChild(newRow);
    });
}


// DISPLAY SELECTED FIELD

function displaySelectedField(record) {
    selectedFieldName.textContent =
        record.fieldName;

    moistureLevel =
        Number(record.soilMoisture);

    irrigationProgress = 0;
    irrigationRunning = false;

    currentMoisture.textContent =
        moistureLevel + "%";

    irrigationProgressBar.style.width =
        irrigationProgress + "%";

    irrigationProgressText.textContent =
        irrigationProgress + "%";

    systemStatus.textContent =
        record.irrigationStatus;

    updateLastUpdatedTime();
}


// CHANGE SELECTED FIELD

irrigationField.addEventListener(
    "change",
    function () {
        const selectedFieldId =
            Number(irrigationField.value);

        const selectedRecord =
            irrigationRecords.find(
                function (record) {
                    return (
                        record.fieldId ===
                        selectedFieldId
                    );
                }
            );

        if (selectedRecord) {
            displaySelectedField(selectedRecord);
        }
    }
);


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

    const moistureTarget =
        Number(targetMoistureInput.value) || 75;

    if (moistureLevel < moistureTarget) {
        moistureLevel++;
    }

    if (
        irrigationProgress >= 100 ||
        moistureLevel >= moistureTarget
    ) {
        irrigationProgress = 100;
        irrigationRunning = false;

        systemStatus.textContent = "Completed";
        activeSystems.textContent = "0";
    }

    updateProgressDisplay();
    updateLastUpdatedTime();
}


// UPDATE PROGRESS DISPLAY

function updateProgressDisplay() {
    irrigationProgressBar.style.width =
        irrigationProgress + "%";

    irrigationProgressText.textContent =
        irrigationProgress + "%";

    currentMoisture.textContent =
        moistureLevel + "%";
}


// SAVE IRRIGATION SETTINGS

irrigationSettingsForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const moistureThreshold =
            document.getElementById(
                "moistureThreshold"
            );

        const maximumDuration =
            document.getElementById(
                "maximumDuration"
            );

        const threshold =
            Number(moistureThreshold.value);

        const newTarget =
            Number(targetMoistureInput.value);

        const duration =
            Number(maximumDuration.value);

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


// ADD TEMPORARY IRRIGATION SCHEDULE

addScheduleButton.addEventListener(
    "click",
    function () {
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
            alert(
                "Please enter a valid duration."
            );

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
    }
);


// UPDATE LAST UPDATED TIME

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


// INITIALISE PAGE

loadIrrigationData();

// Update an active irrigation process every three seconds
setInterval(updateIrrigation, 3000);