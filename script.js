const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchBtn");

const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");

const locationName = document.getElementById("locationName");
const weatherIcon = document.getElementById("weatherIcon");
const condition = document.getElementById("condition");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const forecastContainer = document.getElementById("forecastContainer");

const backgroundClasses = [
    "default-weather",
    "sunny-weather",
    "cloudy-weather",
    "rainy-weather",
    "snowy-weather",
    "stormy-weather",
    "foggy-weather"
];

function getWeatherDetails(code) {
    if (code === 0) {
        return {
            description: "Clear sky",
            icon: "☀️",
            background: "sunny-weather"
        };
    }

    if (code >= 1 && code <= 3) {
        return {
            description: "Partly cloudy",
            icon: "⛅",
            background: "cloudy-weather"
        };
    }

    if (code === 45 || code === 48) {
        return {
            description: "Foggy",
            icon: "🌫️",
            background: "foggy-weather"
        };
    }

    if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {
        return {
            description: "Rainy",
            icon: "🌧️",
            background: "rainy-weather"
        };
    }

    if (
        (code >= 71 && code <= 77) ||
        (code >= 85 && code <= 86)
    ) {
        return {
            description: "Snowy",
            icon: "❄️",
            background: "snowy-weather"
        };
    }

    if (code >= 95) {
        return {
            description: "Thunderstorm",
            icon: "⛈️",
            background: "stormy-weather"
        };
    }

    return {
        description: "Weather unavailable",
        icon: "🌤️",
        background: "default-weather"
    };
}

function changeBackground(weatherClass) {
    document.body.classList.remove(...backgroundClasses);
    document.body.classList.add(weatherClass);
}

function formatDay(dateString) {
    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        weekday: "short"
    });
}

function displayForecast(daily) {
    forecastContainer.innerHTML = "";

    for (let index = 0; index < 5; index += 1) {
        const forecastWeather = getWeatherDetails(
            daily.weather_code[index]
        );

        const forecastCard = document.createElement("article");
        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <strong>${formatDay(daily.time[index])}</strong>
            <p class="forecast-icon">${forecastWeather.icon}</p>
            <p>${Math.round(daily.temperature_2m_max[index])}°</p>
            <p>${Math.round(daily.temperature_2m_min[index])}°</p>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}

async function getWeather(city) {
    message.textContent = "Loading weather...";
    weatherResult.classList.add("hidden");
    searchButton.disabled = true;

    try {
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search" +
            `?name=${encodeURIComponent(city)}` +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Could not search for that city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const location = geoData.results[0];

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${location.latitude}` +
            `&longitude=${location.longitude}` +
            "&current=temperature_2m,apparent_temperature," +
            "relative_humidity_2m,weather_code,wind_speed_10m" +
            "&daily=weather_code,temperature_2m_max," +
            "temperature_2m_min" +
            "&temperature_unit=fahrenheit" +
            "&wind_speed_unit=mph" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Could not load the weather.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const currentWeather = getWeatherDetails(
            current.weather_code
        );

        locationName.textContent =
            `${location.name}, ${location.admin1 ?? location.country}`;

        weatherIcon.textContent = currentWeather.icon;
        condition.textContent = currentWeather.description;

        temperature.textContent =
            `${Math.round(current.temperature_2m)}°F`;

        feelsLike.textContent =
            `${Math.round(current.apparent_temperature)}°F`;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        wind.textContent =
            `${Math.round(current.wind_speed_10m)} mph`;

        displayForecast(weatherData.daily);
        changeBackground(currentWeather.background);

        message.textContent = "";
        weatherResult.classList.remove("hidden");
    } catch (error) {
        message.textContent = error.message;
        weatherResult.classList.add("hidden");
        changeBackground("default-weather");
    } finally {
        searchButton.disabled = false;
    }
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city.";
        return;
    }

    getWeather(city);
});