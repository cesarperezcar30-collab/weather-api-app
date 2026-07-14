const button = document.getElementById("searchBtn");
const result = document.getElementById("weatherResult");
const cityInput = document.getElementById("cityInput");
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        button.click();
    }
});

function getWeatherCondition(code) {
    if (code === 0) return "Clear sky ☀️";
    if (code >= 1 && code <= 3) return "Partly cloudy ⛅";
    if (code === 45 || code === 48) return "Fog 🌫️";
    if (code >= 51 && code <= 67) return "Rain 🌧️";
    if (code >= 71 && code <= 77) return "Snow ❄️";
    if (code >= 80 && code <= 82) return "Rain showers 🌦️";
    if (code >= 95) return "Thunderstorm ⛈️";

    return "Unknown weather";
}

button.addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value;

    if (city === "") {
        result.innerHTML = "Please enter a city.";
        return;
    }

    result.innerHTML = "Loading...";

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            result.innerHTML = "City not found.";
            return;
        }

        const location = geoData.results[0];

       const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
);
        const weatherData = await weatherResponse.json();
        const weather = weatherData.current_weather;

      let forecastHTML = "";

for (let i = 0; i < 5; i++) {
    forecastHTML += `
        <p>
            <strong>${weatherData.daily.time[i]}</strong>:
            High ${weatherData.daily.temperature_2m_max[i]}°F/
            Low ${weatherData.daily.temperature_2m_min[i]}°F
        </p>
    `;
}

result.innerHTML = `
    <h2>${location.name}, ${location.country}</h2>
    <p>🌡 Temperature: ${weather.temperature}°F</p>
    <p>💨 Wind Speed: ${weather.windspeed} mph/h</p>
    <p>☁️ Condition: ${getWeatherCondition(weather.weathercode)}</p>

    <h3>5-Day Forecast</h3>
    ${forecastHTML}
`;

    } catch (error) {
        result.innerHTML = "Something went wrong. Try again.";
    }
});