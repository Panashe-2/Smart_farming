// FARMSENSE WEATHER PAGE

const WEATHER_API_URL =
    "http://localhost:3000/api/weather";


// GET WEATHER PAGE ELEMENTS

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


// LOAD WEATHER DATA FROM BACKEND

async function loadWeatherData() {
    try {
        const response = await fetch(
            WEATHER_API_URL
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load weather data"
            );
        }

        const result = await response.json();
        const weather = result.data;

        displayWeather(weather);
        displayLocation(weather.location);
        displayCurrentDate();
    } catch (error) {
        console.error(error);

        weatherDescription.textContent =
            "Weather unavailable";

        alert(
            "Weather data could not be loaded. " +
            "Make sure the backend server is running."
        );
    }
}


// DISPLAY WEATHER INFORMATION

function displayWeather(weather) {
    const todayForecast =
        weather.forecast &&
        weather.forecast.length > 0
            ? weather.forecast[0]
            : null;

    currentTemperature.textContent =
        weather.temperature + "°C";

    currentHumidity.textContent =
        weather.humidity + "%";

    currentWind.textContent =
        weather.windSpeed + " km/h";

    currentRain.textContent =
        weather.rainfallChance + "%";

    largeTemperature.textContent =
        weather.temperature + "°C";

    weatherDescription.textContent =
        weather.condition;

    if (todayForecast) {
        maximumTemperature.textContent =
            todayForecast.maximumTemperature + "°C";

        minimumTemperature.textContent =
            todayForecast.minimumTemperature + "°C";
    } else {
        maximumTemperature.textContent =
            weather.temperature + "°C";

        minimumTemperature.textContent =
            weather.temperature + "°C";
    }

    feelsLike.textContent =
        weather.temperature + "°C";
}


// DISPLAY WEATHER LOCATION

function displayLocation(location) {
    weatherLocation.innerHTML = "";

    const locationOption =
        document.createElement("option");

    locationOption.value = location;
    locationOption.textContent = location;

    weatherLocation.appendChild(locationOption);
}


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


// REFRESH WEATHER WHEN LOCATION CHANGES

weatherLocation.addEventListener(
    "change",
    function () {
        loadWeatherData();
    }
);


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

loadWeatherData();

// Refresh weather data every 60 seconds
setInterval(loadWeatherData, 60000);