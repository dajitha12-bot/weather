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

// API Configuration
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Free OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
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
    if (city) {
        // Save the searched location
        localStorage.setItem('lastSearchedLocation', city);
        getWeatherByCity(city);
    }
}

// Get weather by city name
async function getWeatherByCity(city) {
    showLoading();
    
    try {
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }
        
        const forecastData = await forecastResponse.json();
        
        displayWeatherData(currentWeatherData, forecastData);
    } catch (error) {
        showError('Unable to find the city. Please check the spelling and try again.');
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
                // Fetch current weather
                const currentWeatherResponse = await fetch(
                    `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                
                if (!currentWeatherResponse.ok) {
                    throw new Error('Weather data not available');
                }
                
                const currentWeatherData = await currentWeatherResponse.json();
                
                // Fetch 5-day forecast
                const forecastResponse = await fetch(
                    `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                
                if (!forecastResponse.ok) {
                    throw new Error('Forecast data not available');
                }
                
                const forecastData = await forecastResponse.json();
                
                displayWeatherData(currentWeatherData, forecastData);
            } catch (error) {
                showError('Unable to fetch weather data for your location.');
            }
        },
        (error) => {
            showError('Unable to retrieve your location. Please enable location services or search for a city.');
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
    
    // Get forecast for next 5 days (8 data points per day, we'll use midday data)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString();
        
        if (!dailyForecasts[dateString]) {
            dailyForecasts[dateString] = item;
        }
    });
    
    // Convert to array and take next 5 days (excluding today)
    const forecastArray = Object.values(dailyForecasts).slice(1, 6);
    
    forecastArray.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">
                <i class="${getWeatherIconClass(day.weather[0].icon)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Update weather icon based on weather condition
function updateWeatherIcon(iconCode) {
    weatherIconEl.className = getWeatherIconClass(iconCode);
}

// Get Font Awesome icon class based on OpenWeatherMap icon code
function getWeatherIconClass(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-sun';
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

// Handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    showError('There was a problem fetching weather data. Please try again later.');
}

