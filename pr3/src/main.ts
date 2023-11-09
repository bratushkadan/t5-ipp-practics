import './style.css';

import { queryWeatherApiData, windDegToDirection } from './weather';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('No #app node found in html');
}

app.innerHTML = `
  <div>
  <h2 id="weather-header">Weather in</h2>
  <div id="weather-data"></div>
  </div>
`;

queryWeatherApiData().then(data => {
  console.log(data)

  const {name: cityName, main: {humidity, temp, temp_min, temp_max, pressure}, wind: {speed, deg}} = data
  
  const weatherHeaderNode = app.querySelector('#weather-header')!
  const weatherDataNode = app.querySelector('#weather-data')!

  weatherHeaderNode.textContent = `${weatherHeaderNode.textContent} ${cityName}`
  weatherDataNode.innerHTML = `
    <div>
      Температура: ${temp}ºC (min = ${temp_min}ºC, max = ${temp_max}ºC)
    </div>
    <div>
      Влажность: ${humidity}%
    </div>
    <div>
      Давление ${(pressure * 0.750064).toFixed(1)} мм рт. ст.
    </div>
    <div>
      Скорость ветра: ${speed}м/с (${windDegToDirection(deg)})
    </div>`
})
