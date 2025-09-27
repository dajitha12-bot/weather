
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

// API Key (In a real app, this would be stored securely)
const API_KEY = 'your_api_key_here'; // Replace with your actual API key

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Try to get weather by user's location on app start
    getWeatherByLocation();
    
    // Add event listeners
    searchBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) {
                getWeatherByCity(city);
            }
        }
    });
    
    locationBtn.addEventListener('click', getWeatherByLocation);
});

// Get weather by city name
async function getWeatherByCity(city) {
    showLoading();
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeatherData(data);
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
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('Weather data not available');
                }
                
                const data = await response.json();
                displayWeatherData(data);
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
function displayWeatherData(data) {
    // Update location
    locationEl.textContent = `${data.name}, ${data.sys.country}`;
    
    // Update date
    const now = new Date();
    dateEl.textContent = formatDate(now);
    
    // Update temperature
    temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
    
    // Update weather description and icon
    descriptionEl.textContent = data.weather[0].description;
    updateWeatherIcon(data.weather[0].icon);
    
    // Update details
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    humidityEl.textContent = `${data.main.humidity}%`;
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
    
    // Show weather data and hide loading/error
    weatherDataEl.style.display = 'block';
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
}

// Update weather icon based on weather condition
function updateWeatherIcon(iconCode) {
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
    
    weatherIconEl.className = iconMap[iconCode] || 'fas fa-sun';
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

// For demonstration purposes, we'll use mock data if API key is not provided
if (API_KEY === 'your_api_key_here') {
    // Use mock data for demonstration
    const mockData = {
        name: 'Cotton Candy City',
        sys: { country: 'CC' },
        main: {
            temp: 22,
            feels_like: 24,
            humidity: 65,
            pressure: 1012
        },
        weather: [{ description: 'Partly cloudy', icon: '02d' }],
        wind: { speed: 3.5 }
    };
    
    // Override the API functions with mock data
    const originalGetWeatherByCity = getWeatherByCity;
    const originalGetWeatherByLocation = getWeatherByLocation;
    
    getWeatherByCity = function(city) {
        showLoading();
        setTimeout(() => {
            mockData.name = city;
            displayWeatherData(mockData);
        }, 800);
    };
    
    getWeatherByLocation = function() {
        showLoading();
        setTimeout(() => {
            displayWeatherData(mockData);
        }, 800);
    };
    
    // Show a message about using demo data
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const footer = document.querySelector('.footer');
            footer.innerHTML += '<p style="color:#ff6b6b; margin-top:5px;">Using demo data. Add your API key for real weather information.</p>';
        }, 1000);
    });
}

