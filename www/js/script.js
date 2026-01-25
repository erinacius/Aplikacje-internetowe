const API_KEY = 'acec488fbcc470eab8492bd9892da7fc';
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');
const toggleBtn = document.getElementById('toggleContent');
const mainContent = document.getElementById('mainContent');
const backButton = document.getElementById('backButton');
const showContentBtn = document.getElementById('showContent');

let isContentVisible = true;
toggleBtn.addEventListener('click', () => {
    mainContent.classList.add('hidden');
    backButton.classList.remove('hidden');
});

showContentBtn.addEventListener('click', () => {
    mainContent.classList.remove('hidden');
    backButton.classList.add('hidden');
});

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

async function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Wprowadź nazwę miasta');
        return;
    }

    hideError();
    hideWeather();
    showLoading();
    
    try {
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeatherXHR(city),
            fetchForecastFetch(city)
        ]);

        console.log('Current Weather Data:', currentData);
        console.log('Forecast Data:', forecastData);

        hideLoading();
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
    } catch (error) {
        hideLoading();
        showError('Brak miasta lub błąd sieci   ');
        console.error('Error:', error);
    }
}

function fetchCurrentWeatherXHR(city) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const units = document.getElementById('unitSelect').value;
        const url = `${CURRENT_WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=pl`;
        
        xhr.open('GET', url, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve(data);
                } catch (e) {
                    reject(new Error('Nie działa parsowanie JSON'));
                }
            } else {
                reject(new Error(`Nie działa HTTP: ${xhr.status}`));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Nie działa połączenie sieciowe'));
        };
        
        xhr.send();
    });
}

async function fetchForecastFetch(city) {
    const units = document.getElementById('unitSelect').value;
    const url = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=pl`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Nie działa HTTP: ${response.status}`);
    }
    
    return await response.json();
}

function displayCurrentWeather(data) {
    const units = document.getElementById('unitSelect').value;
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const speedUnit = units === 'metric' ? 'm/s' : 'mph';
    
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} ${speedUnit}`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('weatherIcon').alt = data.weather[0].description;
    
    displayExtraInfo(data, tempUnit);
    
    currentWeatherDiv.classList.remove('hidden');
}

function displayExtraInfo(data, tempUnit) {
    const showExtraInfo = document.getElementById('showExtraInfo').checked;
    const showSunTimes = document.getElementById('showSunTimes').checked;
    const showFullDetails = document.getElementById('showFullDetails').checked;
    
    let html = '';
    
    if (showExtraInfo) {
        html += '<div class="extra-info-title">Dodatkowe informacje</div>';
        html += '<div class="extra-info-content">';
        html += `<strong>Temperatura odczuwalna:</strong> ${Math.round(data.main.feels_like)}${tempUnit}<br>`;
        html += `<strong>Zachmurzenie:</strong> ${data.clouds.all}%<br>`;
        
        if (data.rain && data.rain['1h']) {
            html += `<strong>Opady (1h):</strong> ${data.rain['1h']} mm<br>`;
        }
        if (data.snow && data.snow['1h']) {
            html += `<strong>Śnieg (1h):</strong> ${data.snow['1h']} mm<br>`;
        }
        
        html += `<strong>Współrzędne:</strong> ${data.coord.lat.toFixed(2)}°N, ${data.coord.lon.toFixed(2)}°E`;
        html += '</div>';
    }
    
    if (showSunTimes && data.sys.sunrise && data.sys.sunset) {
        const sunrise = new Date(data.sys.sunrise * 1000);
        const sunset = new Date(data.sys.sunset * 1000);
        const dayLength = ((data.sys.sunset - data.sys.sunrise) / 3600).toFixed(1);
        
        html += '<div class="extra-info-title">Informacje o słońcu</div>';
        html += '<div class="extra-info-content">';
        html += `<strong>Wschód słońca:</strong> ${sunrise.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}<br>`;
        html += `<strong>Zachód słońca:</strong> ${sunset.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}<br>`;
        html += `<strong>Długość dnia:</strong> ${dayLength} godzin`;
        html += '</div>';
    }
    
    if (showFullDetails) {
        html += '<div class="extra-info-title">Pełne szczegóły</div>';
        html += '<div class="extra-info-content">';
        html += `<strong>Temperatura:</strong><br>`;
        html += `&nbsp;&nbsp;• Aktualna: ${Math.round(data.main.temp)}${tempUnit}<br>`;
        html += `&nbsp;&nbsp;• Odczuwalna: ${Math.round(data.main.feels_like)}${tempUnit}<br>`;
        html += `&nbsp;&nbsp;• Min: ${Math.round(data.main.temp_min)}${tempUnit} / Max: ${Math.round(data.main.temp_max)}${tempUnit}<br>`;
        html += `<strong>Atmosfera:</strong><br>`;
        html += `&nbsp;&nbsp;• Ciśnienie: ${data.main.pressure} hPa<br>`;
        html += `&nbsp;&nbsp;• Wilgotność: ${data.main.humidity}%<br>`;
        html += `&nbsp;&nbsp;• Widoczność: ${(data.visibility / 1000).toFixed(1)} km<br>`;
        html += `&nbsp;&nbsp;• Zachmurzenie: ${data.clouds.all}%`;
        html += '</div>';
    }
    
    const extraInfoDiv = document.getElementById('extraInfo');
    if (html) {
        extraInfoDiv.innerHTML = html;
        extraInfoDiv.classList.remove('hidden');
    } else {
        extraInfoDiv.classList.add('hidden');
    }
}

function displayForecast(data) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    
    const forecasts = data.list.slice(0, 15);
    
    forecasts.forEach(item => {
        const forecastItem = createForecastItem(item);
        forecastList.appendChild(forecastItem);
    });
    
    forecastDiv.classList.remove('hidden');
}

function createForecastItem(item) {
    const div = document.createElement('div');
    div.className = 'forecast-item';
    
    const units = document.getElementById('unitSelect').value;
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const speedUnit = units === 'metric' ? 'm/s' : 'mph';
    
    const date = new Date(item.dt * 1000);
    const dateString = formatDate(date);
    
    const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
    
    div.innerHTML = `
        <div class="forecast-date">${dateString}</div>
        <img src="${iconUrl}" alt="${item.weather[0].description}" class="forecast-icon">
        <div class="forecast-temp">${Math.round(item.main.temp)}${tempUnit}</div>
        <div class="forecast-desc">${item.weather[0].description}</div>
        <div class="forecast-details">
            <span>${item.main.humidity}%</span>
            <span>${item.wind.speed} ${speedUnit}</span>
        </div>
    `;
    
    return div;
}

function formatDate(date) {
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('pl-PL', options);
}

// Funkcje pomocnicze UI
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
    searchBtn.disabled = true;
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
    searchBtn.disabled = false;
}

function hideWeather() {
    currentWeatherDiv.classList.add('hidden');
    forecastDiv.classList.add('hidden');
}