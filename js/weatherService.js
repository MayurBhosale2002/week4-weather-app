import { API_KEY, BASE_URL } from "./config.js";

export default class WeatherService {
  cacheTime = 10 * 60 * 1000;

  getCache(key) {
    const data = localStorage.getItem(key);

    if (!data) return null;

    const obj = JSON.parse(data);

    if (Date.now() - obj.time > this.cacheTime) {
      localStorage.removeItem(key);
      return null;
    }

    return obj.data;
  }

  setCache(key, data) {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        time: Date.now(),
      }),
    );
  }

  async getCurrent(city) {
    const key = `current_${city}`;

    const cached = this.getCache(key);

    if (cached) return cached;

    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`,
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    this.setCache(key, data);

    return data;
  }

  async getForecast(city) {
    const key = `forecast_${city}`;

    const cached = this.getCache(key);

    if (cached) return cached;

    const res = await fetch(
      `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`,
    );

    if (!res.ok) throw new Error("Forecast error");

    const data = await res.json();

    this.setCache(key, data);

    return data;
  }
}
