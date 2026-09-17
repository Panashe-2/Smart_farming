
// FARMSENSE DASHBOARD
// Temporary simulated data


// Get dashboard elements
const soilMoistureElement = document.getElementById("soilMoisture");
const temperatureElement = document.getElementById("temperature");
const humidityElement = document.getElementById("humidity");
const cropHealthElement = document.getElementById("cropHealth");
const lastUpdatedElement = document.getElementById("lastUpdated");

const irrigationButton = document.getElementById("irrigationButton");
const irrigationStatus = document.getElementById("irrigationStatus");
const irrigationProgress = document.getElementById("irrigationProgress");
const progressText = document.getElementById("progressText");

const logoutButton = document.getElementById("logoutButton");
const chartPeriod = document.getElementById("chartPeriod");

// Tracks whether irrigation is running
let irrigationRunning = true;
let currentProgress = 72;


// MOISTURE CHART


const chartCanvas = document.getElementById("moistureChart");

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

                borderColor: "rgb(71, 124, 80)",
                backgroundColor: "rgb(71 124 80 / 15%)",

                borderWidth: 2,
                tension: 0.4,
                fill: true,

                pointBackgroundColor: "rgb(71, 124, 80)",
                pointBorderColor: "rgb(255, 255, 255)",
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
                        return context.parsed.y + "% moisture";
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
                    color: "rgb(220 220 220 / 60%)"
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


// GENERATE SIMULATED DATA


function generateDashboardData() {
    const soilMoisture = randomNumber(62, 75);
    const temperature = randomDecimal(22, 29);
    const humidity = randomNumber(55, 72);

    let cropHealth = "Good";

    if (soilMoisture < 65 || temperature > 28) {
        cropHealth = "Monitor";
    }

    return {
        soilMoisture: soilMoisture,
        temperature: temperature,
        humidity: humidity,
        cropHealth: cropHealth
    };
}

// Generate a random whole number
function randomNumber(minimum, maximum) {
    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
}

// Generate a random decimal number
function randomDecimal(minimum, maximum) {
    return (
        Math.random() * (maximum - minimum) + minimum
    ).toFixed(1);
}


// UPDATE THE DASHBOARD


function updateDashboard() {
    const data = generateDashboardData();

    soilMoistureElement.textContent =
        data.soilMoisture + "%";

    temperatureElement.textContent =
        data.temperature + "°C";

    humidityElement.textContent =
        data.humidity + "%";

    cropHealthElement.textContent =
        data.cropHealth;

    updateChart(data.soilMoisture);
    updateTime();
}


// UPDATE THE CHART

function updateChart(newMoistureValue) {
    const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    moistureChart.data.labels.push(currentTime);
    moistureChart.data.datasets[0].data.push(
        newMoistureValue
    );

    // Keep only the latest seven readings
    if (moistureChart.data.labels.length > 7) {
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


irrigationButton.addEventListener("click", function () {
    irrigationRunning = !irrigationRunning;

    if (irrigationRunning) {
        irrigationStatus.textContent = "Automatic";
        irrigationButton.textContent = "Pause irrigation";
    } else {
        irrigationStatus.textContent = "Paused";
        irrigationButton.textContent = "Resume irrigation";
    }
});


// IRRIGATION PROGRESS


function updateIrrigationProgress() {
    if (!irrigationRunning) {
        return;
    }

    if (currentProgress < 100) {
        currentProgress++;

        irrigationProgress.style.width =
            currentProgress + "%";

        progressText.textContent =
            currentProgress + "%";
    } else {
        irrigationStatus.textContent = "Completed";
        irrigationButton.textContent =
            "Irrigation completed";

        irrigationButton.disabled = true;
    }
}


// CHART PERIOD SELECTION


chartPeriod.addEventListener("change", function () {
    const selectedPeriod = chartPeriod.value;

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
});


// LOGOUT BUTTON


logoutButton.addEventListener("click", function () {
    const shouldLogout = confirm(
        "Are you sure you want to log out?"
    );

    if (shouldLogout) {
        window.location.href = "index.html";
    }
});

// Show the current time immediately
updateTime();

// Update dashboard readings every five seconds
setInterval(updateDashboard, 5000);

// Update irrigation progress every three seconds
setInterval(updateIrrigationProgress, 3000);