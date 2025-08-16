import * as Location from 'expo-location';
import Config from 'react-native-config';
export interface WeatherData {
	temperature: number;
	description: string;
	humidity: number;
	windSpeed: number;
	icon: string;
	feelsLike: number;
	pressure: number;
	visibility: number;
}

export interface LocationData {
	latitude: number;
	longitude: number;
	cityName?: string;
	countryCode?: string;
}

class WeatherService {
	private apiKey: string;
	private baseUrl: string;
	private units: string;

	constructor() {
		this.apiKey = Config.OPENWEATHERMAP_API_KEY || '';
		this.baseUrl = Config.OPENWEATHERMAP_BASE_URL || 'https://api.openweathermap.org/data/2.5';
		this.units = Config.WEATHER_UNITS || 'metric';
	}

	async requestLocationPermission(): Promise<boolean> {
		const { status } = await Location.requestForegroundPermissionsAsync();
		return status === 'granted';
	}

	async getCurrentLocation(): Promise<LocationData | null> {
		try {
			const hasPermission = await this.requestLocationPermission();
			if (!hasPermission) {
				console.log('Location permission denied');
				return null;
			}

			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			// Get city name from coordinates using reverse geocoding
			const reverseGeocode = await Location.reverseGeocodeAsync({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});

			const cityName = reverseGeocode[0]?.city || reverseGeocode[0]?.subregion || undefined;
			const countryCode = reverseGeocode[0]?.country || undefined;

			return {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				cityName,
				countryCode,
			};
		} catch (error) {
			console.error('Error getting location:', error);
			return null;
		}
	}

	async getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
		try {
			if (!this.apiKey) {
				console.warn('OpenWeatherMap API key not configured in .env file');
				return this.getMockWeatherData();
			}

			const url = `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=${this.units}`;
			
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Weather API error: ${response.status}`);
			}

			const data = await response.json();
			
			return {
				temperature: Math.round(data.main.temp),
				description: data.weather[0].description,
				humidity: data.main.humidity,
				windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
				icon: data.weather[0].icon,
				feelsLike: Math.round(data.main.feels_like),
				pressure: data.main.pressure,
				visibility: Math.round(data.visibility / 1000), // Convert m to km
			};
		} catch (error) {
			console.error('Error fetching weather data:', error);
			return this.getMockWeatherData();
		}
	}

	private getMockWeatherData(): WeatherData {
		return {
			temperature: 27,
			description: 'Partly Cloudy',
			humidity: 72.5,
			windSpeed: 2.4,
			icon: '02d',
			feelsLike: 29,
			pressure: 1013,
			visibility: 10,
		};
	}

	getWeatherIcon(iconCode: string): string {
		const iconMap: { [key: string]: string } = {
			'01d': 'weather-sunny',
			'01n': 'weather-night',
			'02d': 'weather-partly-cloudy',
			'02n': 'weather-night-partly-cloudy',
			'03d': 'weather-cloudy',
			'03n': 'weather-cloudy',
			'04d': 'weather-cloudy',
			'04n': 'weather-cloudy',
			'09d': 'weather-rainy',
			'09n': 'weather-rainy',
			'10d': 'weather-rainy',
			'10n': 'weather-rainy',
			'11d': 'weather-lightning',
			'11n': 'weather-lightning',
			'13d': 'weather-snowy',
			'13n': 'weather-snowy',
			'50d': 'weather-fog',
			'50n': 'weather-fog',
		};
		
		return iconMap[iconCode] || 'weather-partly-cloudy';
	}

	formatTime(): string {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		const day = now.getDate();
		const month = now.toLocaleString('en-US', { month: 'short' });
		
		return `${hours}:${minutes} | ${day} ${month}`;
	}
}

export default new WeatherService();
