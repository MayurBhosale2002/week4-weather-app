export default class Storage {
  static saveCity(city) {
    let cities = this.getCities();

    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem("cities", JSON.stringify(cities));
    }
  }

  static getCities() {
    return JSON.parse(localStorage.getItem("cities")) || [];
  }

  static removeCity(city) {
    let cities = this.getCities().filter((c) => c !== city);

    localStorage.setItem("cities", JSON.stringify(cities));
  }
}
