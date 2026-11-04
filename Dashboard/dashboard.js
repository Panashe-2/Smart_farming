
// FARMSENSE OVERVIEW DASHBOARD

const API_URL = "http://localhost:3000/api";


// GET DASHBOARD ELEMENTS

const soilMoistureElement =
    document.getElementById("soilMoisture");

const temperatureElement =
    document.getElementById("temperature");

const humidityElement =
    document.getElementById("humidity");

const cropHealthElement =
    document.getElementById("cropHealth");

const lastUpdatedElement =
    document.getElementById("lastUpdated");

const irrigationButton =
    document.getElementById("irrigationButton");

const irrigationStatus =
    document.getElementById("irrigationStatus");

const irrigationProgress =
    document.getElementById("irrigationProgress");

const progressText =
    document.getElementById("progressText");

const logoutButton =
    document.getElementById("logoutButton");

const chartPeriod =
    document.getElementById("chartPeriod");


// DASHBOARD STATE

let irrigationRunning = false;
let currentProgress = 0;


// MOISTURE CHART

const chartCanvas =
    document.getElementById("moistureChart");

const moistureChart = new Chart(chartCanvas, {
    type: "line",

    data: {
        labels: [
            "06:00",
            "08:00",
            "10:00",
            "12:00",
            "14:00",
            "16:00",
            "18:00"
        ],

        datasets: [
            {
                label: "Soil moisture",

                data: [61, 63, 65, 64, 67, 68, 68],

                borderColor:
                    "rgb(71, 124, 80)",

                backgroundColor:
                    "rgb(71 124 80 / 15%)",

                borderWidth: 2,
                tension: 0.4,
                fill: true,

                pointBackgroundColor:
                    "rgb(71, 124, 80)",

                pointBorderColor:
                    "rgb(255, 255, 255)",

                pointBorderWidth: 2,
                pointRadius: 4
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        return (
                            context.parsed.y +
                            "% moisture"
                        );
                    }
                }
            }
        },

        scales: {
            y: {
                beginAtZero: false,
                suggestedMin: 40,
                suggestedMax: 90,

                ticks: {
                    callback: function (value) {
                        return value + "%";
                    }
                },

                grid: {
                    color:
                        "rgb(220 220 220 / 60%)"
                }
            },

            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});


// LOAD DASHBOARD DATA FROM BACKEND

async function loadDashboardData() {
    try {
        const responses = await Promise.all([
            fetch(`${API_URL}/dashboard`),
            fetch(`${API_URL}/fields`),
            fetch(`${API_URL}/weather`),
            fetch(`${API_URL}/irrigation`)
        ]);

        const failedResponse =
            responses.some(function (response) {
                return !response.ok;
            });

        if (failedResponse) {
            throw new Error(
                "Unable to load dashboard data"
            );
        }

        const [
            dashboardResult,
            fieldsResult,
            weatherResult,
            irrigationResult
        ] = await Promise.all(
            responses.map(function (response) {
                return response.json();
            })
        );

        const summary =
            dashboardResult.data;

        const fields =
            fieldsResult.data;

        const weather =
            weatherResult.data;

        const irrigationRecords =
            irrigationResult.data;

        displayDashboardData(
            summary,
            fields,
            weather,
            irrigationRecords
        );
    } catch (error) {
        console.error(error);

        soilMoistureElement.textContent =
            "Unavailable";

        temperatureElement.textContent =
            "Unavailable";

        humidityElement.textContent =
            "Unavailable";

        cropHealthElement.textContent =
            "Unavailable";

        alert(
            "Dashboard data could not be loaded. " +
            "Make sure the backend server is running."
        );
    }
}


// DISPLAY BACKEND DATA

function displayDashboardData(
    summary,
    fields,
    weather,
    irrigationRecords
) {
    const totalMoisture =
        fields.reduce(function (total, field) {
            return total + field.soilMoisture;
        }, 0);

    const averageMoisture =
        fields.length > 0
            ? totalMoisture / fields.length
            : 0;

    soilMoistureElement.textContent =
        averageMoisture.toFixed(1) + "%";

    temperatureElement.textContent =
        weather.temperature + "°C";

    humidityElement.textContent =
        weather.humidity + "%";

    if (
        summary.healthyFields ===
        summary.totalFields
    ) {
        cropHealthElement.textContent =
            "Excellent";
    } else if (
        summary.healthyFields >=
        summary.totalFields / 2
    ) {
        cropHealthElement.textContent =
            "Good";
    } else {
        cropHealthElement.textContent =
            "Monitor";
    }

    const scheduledIrrigation =
        irrigationRecords.find(
            function (record) {
                return (
                    record.irrigationStatus ===
                    "Scheduled"
                );
            }
        );

    if (scheduledIrrigation) {
        irrigationStatus.textContent =
            "Scheduled";

        irrigationRunning = false;
        currentProgress = 0;

        irrigationButton.textContent =
            "Start irrigation";
    } else {
        irrigationStatus.textContent =
            "Not required";

        irrigationRunning = false;
        currentProgress = 0;

        irrigationButton.textContent =
            "Start irrigation";
    }

    updateIrrigationDisplay();
    updateChart(averageMoisture);
    updateTime();
}


// UPDATE THE CHART

function updateChart(newMoistureValue) {
    const currentTime =
        new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    moistureChart.data.labels.push(
        currentTime
    );

    moistureChart.data.datasets[0].data.push(
        Number(newMoistureValue.toFixed(1))
    );

    if (
        moistureChart.data.labels.length > 7
    ) {
        moistureChart.data.labels.shift();

        moistureChart.data.datasets[0].data.shift();
    }

    moistureChart.update();
}


// UPDATE LAST UPDATED TIME

function updateTime() {
    const currentTime = new Date();

    lastUpdatedElement.textContent =
        currentTime.toLocaleString();
}


// IRRIGATION BUTTON

irrigationButton.addEventListener(
    "click",
    function () {
        irrigationRunning =
            !irrigationRunning;

        if (irrigationRunning) {
            irrigationStatus.textContent =
                "Running";

            irrigationButton.textContent =
                "Pause irrigation";
        } else {
            irrigationStatus.textContent =
                "Paused";

            irrigationButton.textContent =
                "Resume irrigation";
        }

        updateTime();
    }
);


// UPDATE IRRIGATION PROGRESS

function updateIrrigationProgress() {
    if (!irrigationRunning) {
        return;
    }

    if (currentProgress < 100) {
        currentProgress++;

        updateIrrigationDisplay();
    }

    if (currentProgress >= 100) {
        irrigationRunning = false;

        irrigationStatus.textContent =
            "Completed";

        irrigationButton.textContent =
            "Irrigation completed";

        irrigationButton.disabled = true;
    }

    updateTime();
}


// DISPLAY IRRIGATION PROGRESS

function updateIrrigationDisplay() {
    irrigationProgress.style.width =
        currentProgress + "%";

    progressText.textContent =
        currentProgress + "%";
}


// CHART PERIOD SELECTION

chartPeriod.addEventListener(
    "change",
    function () {
        const selectedPeriod =
            chartPeriod.value;

        if (selectedPeriod === "today") {
            moistureChart.data.labels = [
                "06:00",
                "08:00",
                "10:00",
                "12:00",
                "14:00",
                "16:00",
                "18:00"
            ];

            moistureChart.data.datasets[0].data =
                [61, 63, 65, 64, 67, 68, 68];
        }

        if (selectedPeriod === "week") {
            moistureChart.data.labels = [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ];

            moistureChart.data.datasets[0].data =
                [64, 67, 63, 70, 68, 72, 69];
        }

        if (selectedPeriod === "month") {
            moistureChart.data.labels = [
                "Week 1",
                "Week 2",
                "Week 3",
                "Week 4"
            ];

            moistureChart.data.datasets[0].data =
                [62, 66, 70, 68];
        }

        moistureChart.update();
    }
);


// LOGOUT BUTTON

logoutButton.addEventListener(
    "click",
    function () {
        const shouldLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (shouldLogout) {
            window.location.href =
                "index.html";
        }
    }
);


// INITIALISE DASHBOARD

loadDashboardData();

// Refresh backend information every 30 seconds
setInterval(loadDashboardData, 30000);

// Update active irrigation every three seconds
setInterval(updateIrrigationProgress, 3000);