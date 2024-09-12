import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export const weatherApi = {
  getCurrentWeather: async (city: string) => {
    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
      return response.data;
    } catch (error: any) {
      logger.error('OpenWeatherMap API error:', error);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }
};