import axios from 'axios';
import dotenv from 'dotenv';
// import { logger } from '../utils/logger';

dotenv.config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export const weatherApi = {
  getCurrentWeatherForMultipleCities: async (city: string) => {
    try {
      console.log(`Fetching weather for city: ${city}`);
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/find?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      console.log('OpenWeatherMap API response:', JSON.stringify(response.data, null, 2));
      if (response.data.count > 0) {
        return response.data.list;
      } else {
        throw new Error('No cities found');
      }
    } catch (error: any) {
      console.error('OpenWeatherMap API error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  },

  getCurrentWeatherByCoordinates: async (lat: number, lon: number) => {
    try {
      console.log(`Fetching weather for coordinates: lat=${lat}, lon=${lon}`);
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      console.log('OpenWeatherMap API response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('OpenWeatherMap API error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
};