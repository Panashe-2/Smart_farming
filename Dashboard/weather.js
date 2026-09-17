
// FARMSENSE WEATHER PAGE
// Temporary data until the backend is connected


// Get weather page elements
const currentTemperature =
    document.getElementById("currentTemperature");

const currentHumidity =
    document.getElementById("currentHumidity");

const currentWind =
    document.getElementById("currentWind");

const currentRain =
    document.getElementById("currentRain");

const largeTemperature =
    document.getElementById("largeTemperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const maximumTemperature =
    document.getElementById("maximumTemperature");

const minimumTemperature =
    document.getElementById("minimumTemperature");

const feelsLike =
    document.getElementById("feelsLike");

const weatherLocation =
    document.getElementById("weatherLocation");

const weatherDate =
    document.getElementById("weatherDate");

const logoutButton =
    document.getElementById("logoutButton");


// TEMPORARY WEATHER INFORMATION


const fieldWeatherData = {
    "North Corn Field": {
        temperature: 25,
        humidity: 61,
        wind: 12,
        rain: 35,
        description: "Partly cloudy",
        maximum: 29,
        minimum: 17,
        feelsLike: 26
    },

    "Eastern Corn Field": {
        temperature: 23,
        humidity: 68,
        wind: 16,
        rain: 45,
        description: "Cloudy",
        maximum: 27,
        minimum: 16,
        feelsLike: 24
    }
};


// DISPLAY WEATHER INFORMATION


function displayWeather(fieldName) {
    const weather = fieldWeatherData[fieldName];

    currentTemperature.textContent =
        weather.temperature + "°C";

    currentHumidity.textContent =
        weather.humidity + "%";

    currentWind.textContent =
        weather.wind + " km/h";

    currentRain.textContent =
        weather.rain + "%";

    largeTemperature.textContent =
        weather.temperature + "°C";

    weatherDescription.textContent =
        weather.description;

    maximumTemperature.textContent =
        weather.maximum + "°C";

    minimumTemperature.textContent =
        weather.minimum + "°C";

    feelsLike.textContent =
        weather.feelsLike + "°C";
}


// CHANGE FIELD LOCATION


weatherLocation.addEventListener("change", function () {
    displayWeather(weatherLocation.value);
});


// DISPLAY CURRENT DATE


function displayCurrentDate() {
    const currentDate = new Date();

    weatherDate.textContent =
        currentDate.toLocaleDateString(
            undefined,
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


// TEMPORARY LIVE WEATHER CHANGES


function updateTemporaryWeather() {
    const selectedField = weatherLocation.value;
    const weather = fieldWeatherData[selectedField];

    const temperatureChange =
        randomNumber(-1, 1);

    const humidityChange =
        randomNumber(-2, 2);

    weather.temperature =
        limitValue(
            weather.temperature + temperatureChange,
            15,
            35
        );

    weather.humidity =
        limitValue(
            weather.humidity + humidityChange,
            30,
            90
        );

    weather.feelsLike =
        weather.temperature + 1;

    displayWeather(selectedField);
}

// Generate a random whole number
function randomNumber(minimum, maximum) {
    return Math.floor(
        Math.random() * (maximum - minimum + 1)
    ) + minimum;
}

// Keep a value within a specified range
function limitValue(value, minimum, maximum) {
    return Math.min(
        Math.max(value, minimum),
        maximum
    );
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

// Display the initial data
displayCurrentDate();
displayWeather(weatherLocation.value);

// Temporarily update weather every ten seconds
setInterval(updateTemporaryWeather, 10000);