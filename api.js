// API Configuration
const API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // Free OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather API Service
class WeatherAPI {
    constructor() {
        this.baseUrl = BASE_URL;
        this.apiKey = API_KEY;
    }

    // Get current weather by city name
    async getCurrentWeatherByCity(city) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch current weather: ${error.message}`);
        }
    }

    // Get current weather by coordinates
    async getCurrentWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch current weather: ${error.message}`);
        }
    }

    // Get 5-day forecast by city name
    async getForecastByCity(city) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch forecast: ${error.message}`);
        }
    }

    // Get 5-day forecast by coordinates
    async getForecastByCoords(lat, lon) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch forecast: ${error.message}`);
        }
    }

    // Get both current weather and forecast by city
    async getCompleteWeatherDataByCity(city) {
        try {
            const [currentWeather, forecast] = await Promise.all([
                this.getCurrentWeatherByCity(city),
                this.getForecastByCity(city)
            ]);
            
            return {
                current: currentWeather,
                forecast: forecast
            };
        } catch (error) {
            throw new Error(`Failed to fetch complete weather data: ${error.message}`);
        }
    }

    // Get both current weather and forecast by coordinates
    async getCompleteWeatherDataByCoords(lat, lon) {
        try {
            const [currentWeather, forecast] = await Promise.all([
                this.getCurrentWeatherByCoords(lat, lon),
                this.getForecastByCoords(lat, lon)
            ]);
            
            return {
                current: currentWeather,
                forecast: forecast
            };
        } catch (error) {
            throw new Error(`Failed to fetch complete weather data: ${error.message}`);
        }
    }

    // Utility function to process forecast data
    processForecastData(forecastData) {
        const dailyForecasts = {};
        
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateString = date.toDateString();
            
            // Use midday data for each day (around 12:00 PM)
            if (!dailyForecasts[dateString] || item.dt_txt.includes('12:00:00')) {
                dailyForecasts[dateString] = item;
            }
        });
        
        // Convert to array and take next 5 days (excluding today)
        return Object.values(dailyForecasts).slice(1, 6);
    }

    // Validate city name
    validateCityName(city) {
        if (!city || typeof city !== 'string') {
            return false;
        }
        
        const trimmedCity = city.trim();
        return trimmedCity.length > 0 && /^[a-zA-Z\s\-',.]+$/.test(trimmedCity);
    }

    // Get weather icon mapping
    getWeatherIconMap() {
        return {
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
    }

    // Get weather icon class
    getWeatherIconClass(iconCode) {
        const iconMap = this.getWeatherIconMap();
        return iconMap[iconCode] || 'fas fa-sun';
    }

    // Check if API key is valid (basic validation)
    isApiKeyValid() {
        return this.apiKey && this.apiKey !== 'your_api_key_here' && this.apiKey.length > 10;
    }
}

// Create and export API instance
const weatherAPI = new WeatherAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WeatherAPI, weatherAPI };
}
