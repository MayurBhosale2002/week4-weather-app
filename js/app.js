import WeatherService from "./weatherService.js";
import WeatherUI from "./ui.js";
import Storage from "./storage.js";
import { API_KEY, BASE_URL } from "./config.js";

const service = new WeatherService();
const ui = new WeatherUI();

const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const unitBtn = document.getElementById("unitToggle");
const locBtn = document.getElementById("locBtn");
const favList = document.getElementById("favList");

let isCelsius = true;
let lastCurrentData = null;
let lastForecastData = null;

searchBtn.addEventListener("click", searchWeather);

input.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchWeather();
});

unitBtn.addEventListener("click", toggleUnit);

if (locBtn) {
  locBtn.addEventListener("click", getLocationWeather);
}

loadFavorites();

async function searchWeather() {
  const city = input.value.trim();

  if (!city) {
    ui.showError("Please enter a city name");
    return;
  }

  try {
    ui.showLoading();

    const current = await service.getCurrent(city);
    const forecast = await service.getForecast(city);

    lastCurrentData = current;
    lastForecastData = forecast.list;

    ui.displayCurrentWeather(current, isCelsius);
    ui.displayForecast(forecast.list, isCelsius);

    Storage.saveCity(city);
    loadFavorites();
  } catch (err) {
    console.error(err);
    ui.showError("City not found or API error");
  }
}

function loadFavorites() {
  const cities = Storage.getCities();

  if (!favList) return;

  favList.innerHTML = "";

  cities.forEach((city) => {
    const div = document.createElement("div");
    div.className = "fav-item";

    const name = document.createElement("span");
    name.textContent = city;

    const del = document.createElement("span");
    del.textContent = "❌";
    del.className = "fav-del";

    name.onclick = () => {
      input.value = city;
      searchWeather();
    };

    del.onclick = (e) => {
      e.stopPropagation();
      Storage.removeCity(city);
      loadFavorites();
    };

    div.appendChild(name);
    div.appendChild(del);

    favList.appendChild(div);
  });
}

function toggleUnit() {
  isCelsius = !isCelsius;

  unitBtn.textContent = isCelsius ? "°F" : "°C";

  if (lastCurrentData) {
    ui.displayCurrentWeather(lastCurrentData, isCelsius);
  }

  if (lastForecastData) {
    ui.displayForecast(lastForecastData, isCelsius);
  }
}

function getLocationWeather() {
  if (!navigator.geolocation) {
    ui.showError("Geolocation not supported");
    return;
  }

  ui.showLoading();

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        const res = await fetch(url);

        if (!res.ok) throw new Error("Location API error");

        const data = await res.json();

        lastCurrentData = data;
        ui.displayCurrentWeather(data, isCelsius);
      } catch (err) {
        console.error(err);
        ui.showError("Failed to load location weather");
      }
    },

    (err) => {
      console.error("Geo Error:", err);

      if (err.code === 1) ui.showError("Permission denied. Allow location.");
      else if (err.code === 2) ui.showError("Position unavailable.");
      else if (err.code === 3) ui.showError("Location timeout.");
      else ui.showError("Location failed.");
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}
