require("dotenv").config();

const apiKey = process.env.WEATHER_API_KEY;
const baseUrl = "https://api.weatherapi.com/v1";

async function fetchCurrentWeather(city) {
    const url = new URL(`${baseUrl}/current.json`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", city);

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("No data");
    }
    const payload = await res.json();
    const current = payload.current;

    return {
        temperature: current.temp_c,
        humidity: current.humidity,
        description: current.condition.text,
    };
}

module.exports = { fetchCurrentWeather };
