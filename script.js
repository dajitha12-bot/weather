// Import API module (in a real project, you might use ES6 modules)
// For this example, we'll assume the API code is included before this file

// DOM Elements
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const loadingEl = document.getElementById('loading');
const weatherDataEl = document.getElementById('weather-data');
const errorEl = document.getElementById('error');

// Weather data elements
const locationEl = document.getElementById('location');
const dateEl = document.getElementById('date');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const windSpeedEl = document.getElementById('wind-speed');
const humidityEl = document.getElementById('humidity');
const feelsLikeEl = document.getElementById('feels-like');
const pressureEl = document.getElementById('pressure');
const visibilityEl = document.getElementById('visibility');
const cloudinessEl = document.getElementById('cloudiness');
const forecastContainer = document.getElementById('forecast-container');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check API key validity
    if (!weatherAPI.isApiKeyValid()) {
        showError('Please configure a valid OpenWeatherMap API key.');
        return;
    }

    // Check if user has a saved location
    const savedLocation = localStorage.getItem('lastSearchedLocation');
    if (savedLocation) {
        searchInput.value = savedLocation;
        getWeatherByCity(savedLocation);
    } else {
        // Try to get weather by user's location on app start
        getWeatherByLocation();
    }
    
    // Add event listeners
    searchBtn.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    locationBtn.addEventListener('click', getWeatherByLocation);
});

// Handle search functionality
function handleSearch() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name.');
        return;
    }
    
    if (!weatherAPI.validateCityName(city)) {
        showError('Please enter a valid city name.');
        return;
    }

    // Save the searched location
    localStorage.setItem('lastSearchedLocation', city);
    getWeatherByCity(city);
}

// Get weather by city name
async function getWeatherByCity(city) {
    showLoading();
    
    try {
        const weatherData = await weatherAPI.getCompleteWeatherDataByCity(city);
        displayWeatherData(weatherData.current, weatherData.forecast);
    } catch (error) {
        handleWeatherError(error, 'city');
    }
}

// Get weather by user's location
function getWeatherByLocation() {
    showLoading();
    
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const weatherData = await weatherAPI.getCompleteWeatherDataByCoords(latitude, longitude);
                displayWeatherData(weatherData.current, weatherData.forecast);
            } catch (error) {
                handleWeatherError(error, 'location');
            }
        },
        (error) => {
            handleGeolocationError(error);
        }
    );
}

// Display weather data
function displayWeatherData(currentData, forecastData) {
    // Update location
    locationEl.textContent = `${currentData.name}, ${currentData.sys.country}`;
    
    // Update date
    const now = new Date();
    dateEl.textContent = formatDate(now);
    
    // Update temperature
    temperatureEl.textContent = `${Math.round(currentData.main.temp)}°C`;
    
    // Update weather description and icon
    descriptionEl.textContent = currentData.weather[0].description;
    updateWeatherIcon(currentData.weather[0].icon);
    
    // Update details
    windSpeedEl.textContent = `${currentData.wind.speed} m/s`;
    humidityEl.textContent = `${currentData.main.humidity}%`;
    feelsLikeEl.textContent = `${Math.round(currentData.main.feels_like)}°C`;
    pressureEl.textContent = `${currentData.main.pressure} hPa`;
    visibilityEl.textContent = `${(currentData.visibility / 1000).toFixed(1)} km`;
    cloudinessEl.textContent = `${currentData.clouds.all}%`;
    
    // Update forecast
    updateForecast(forecastData);
    
    // Show weather data and hide loading/error
    weatherDataEl.style.display = 'block';
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
}

// Update forecast display
function updateForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    const processedForecast = weatherAPI.processForecastData(forecastData);
    
    processedForecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <i class="${weatherAPI.getWeatherIconClass(day.weather[0].icon)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Update weather icon based on weather condition
function updateWeatherIcon(iconCode) {
    weatherIconEl.className = weatherAPI.getWeatherIconClass(iconCode);
}

// Format date
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show loading state
function showLoading() {
    loadingEl.style.display = 'block';
    weatherDataEl.style.display = 'none';
    errorEl.style.display = 'none';
}

// Show error message
function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    loadingEl.style.display = 'none';
    weatherDataEl.style.display = 'none';
}

// Handle weather API errors
function handleWeatherError(error, type) {
    console.error('Weather API Error:', error);
    
    if (error.message.includes('404') || error.message.includes('city not found')) {
        showError('City not found. Please check the spelling and try again.');
    } else if (error.message.includes('401')) {
        showError('Invalid API key. Please configure a valid OpenWeatherMap API key.');
    } else if (error.message.includes('429')) {
        showError('API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        showError('Network error. Please check your internet connection.');
    } else {
        showError(`Unable to fetch weather data for ${type}. Please try again.`);
    }
}

// Handle geolocation errors
function handleGeolocationError(error) {
    console.error('Geolocation Error:', error);
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            showError('Location access denied. Please enable location permissions or search for a city.');
            break;
        case error.POSITION_UNAVAILABLE:
            showError('Location information unavailable. Please search for a city.');
            break;
        case error.TIMEOUT:
            showError('Location request timed out. Please try again.');
            break;
        default:
            showError('Unable to retrieve your location. Please search for a city.');
            break;
    }
}
