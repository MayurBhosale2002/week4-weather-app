export default class WeatherUI {
  constructor() {
    this.currentWeatherEl = document.getElementById("currentWeather");
    this.forecastEl = document.getElementById("forecast");
  }

  /* ===============================
     Temperature Convert
  =============================== */

  convert(temp, isCelsius) {
    if (isCelsius) return Math.round(temp);
    return Math.round((temp * 9) / 5 + 32);
  }

  /* ===============================
     Loading
  =============================== */

  showLoading() {
    this.currentWeatherEl.innerHTML = `
    <div class="skeleton skel-title"></div>
    <div class="skeleton skel-temp"></div>

    <div class="skeleton skel-line"></div>
    <div class="skeleton skel-line"></div>
    <div class="skeleton skel-line"></div>
  `;

    this.forecastEl.innerHTML = `
    <div class="forecast-card skeleton skel-forecast"></div>
    <div class="forecast-card skeleton skel-forecast"></div>
    <div class="forecast-card skeleton skel-forecast"></div>
    <div class="forecast-card skeleton skel-forecast"></div>
    <div class="forecast-card skeleton skel-forecast"></div>
  `;
  }

  showError(msg) {
    this.currentWeatherEl.innerHTML = `<div class="error">${msg}</div>`;
    this.forecastEl.innerHTML = "";
  }

  displayCurrentWeather(data, isCelsius = true) {
    this.setBackground(data);

    const temp = this.convert(data.main.temp, isCelsius);
    const feels = this.convert(data.main.feels_like, isCelsius);
    const unit = isCelsius ? "°C" : "°F";

    const time = this.getLocalTime(data.timezone);

    const html = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p class="update-time">Updated: ${time}</p>

      <div class="weather-main">

        <div>
          <div class="temp">${temp}${unit}</div>
          <div class="condition">${data.weather[0].description}</div>
        </div>

        <div class="weather-icon">
          ${this.getWeatherVisual(data)}
        </div>

      </div>

      <div class="details">
        <div>💧 Humidity: ${data.main.humidity}%</div>
        <div>💨 Wind: ${data.wind.speed} m/s</div>
        <div>🌡 Feels: ${feels}${unit}</div>
        <div>📊 Pressure: ${data.main.pressure} hPa</div>
      </div>
    `;

    this.currentWeatherEl.innerHTML = html;
  }

  displayForecast(list, isCelsius = true) {
    let html = "";
    const unit = isCelsius ? "°C" : "°F";

    list.slice(0, 5).forEach((item) => {
      const day = new Date(item.dt * 1000).toLocaleDateString("en", {
        weekday: "short",
      });

      const temp = this.convert(item.main.temp, isCelsius);

      html += `
        <div class="forecast-card">
          <p>${day}</p>
          <p>${temp}${unit}</p>
          <p>${item.weather[0].main}</p>
        </div>
      `;
    });

    this.forecastEl.innerHTML = html;
  }

  getWeatherVisual(data) {
    const icon = data.weather[0].icon;
    const main = data.weather[0].main.toLowerCase();

    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour <= 5;

    if (isNight) {
      return `<div class="moon">🌙</div>`;
    }

    if (main.includes("clear")) {
      return `<div class="sun">☀️</div>`;
    }

    return `
      <img
        src="https://openweathermap.org/img/wn/${icon}@2x.png"
        alt="weather icon"
      />
    `;
  }

  getLocalTime(timezoneOffset) {
    const now = new Date();

    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

    const cityTime = new Date(utcTime + timezoneOffset * 1000);

    return cityTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  setBackground(data) {
    document.body.classList.remove(
      "bg-clear",
      "bg-clouds",
      "bg-rain",
      "bg-snow",
      "bg-night",
    );

    const cond = data.weather[0].main.toLowerCase();
    const hour = new Date().getHours();

    if (hour >= 18 || hour <= 5) {
      document.body.classList.add("bg-night");
      return;
    }

    if (cond.includes("cloud")) {
      document.body.classList.add("bg-clouds");
    } else if (cond.includes("rain") || cond.includes("drizzle")) {
      document.body.classList.add("bg-rain");
    } else if (cond.includes("snow")) {
      document.body.classList.add("bg-snow");
    } else {
      document.body.classList.add("bg-clear");
    }
  }
}
