export async function queryWeatherApiData() {
  const response = await fetch(
    'https://api.openweathermap.org/data/2.5/weather?lat=55.75&lon=37.61&units=metric&appid=e26536e00e9ef226a08cf1c76a63719f'
  );
  const data = await response.json();

  return data;
}

export function windDegToDirection(deg: number): string {
  const directions = [
    'С',
    'C/СВ',
    'СВ',
    'В/СВ',
    'В',
    'В/ЮВ',
    'ЮВ',
    'Ю/ЮВ',
    'Ю',
    'Ю/ЮЗ',
    'ЮЗ',
    'З/ЮЗ',
    'З',
    'З/СЗ',
    'СЗ',
    'С/СЗ',
  ];

  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}
