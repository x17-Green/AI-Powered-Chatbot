import express from 'express';
import { geminiApi } from '../services/gemini';
import { movieDbApi } from '../services/moviedb';
import { weatherApi } from '../services/weather';
import cache from 'memory-cache';
import geocoder from 'node-geocoder';
import dotenv from 'dotenv';
import opencage from 'opencage-api-client'; // Import the OpenCage API client
import { authMiddleware } from '../middleware/auth';

dotenv.config();

// Set up the geocoder
const options = {
  provider: 'opencage',
  apiKey: process.env.OPENCAGE_API_KEY, // Replace with your actual API key
  formatter: null
};

const geo = geocoder(options);

const router = express.Router();

router.use(authMiddleware);
// Your protected routes go here

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await geminiApi.generateChatResponse(message);
    res.json({ response });
  } catch (error: unknown) {
    console.error('Error generating chat response:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to generate response', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to generate response', details: 'An unknown error occurred' });
    }
  }
});

router.get('/movie', async (req, res) => {
  try {
    const { title } = req.query;
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title parameter' });
    }
    const movies = await movieDbApi.searchMovie(title);
    console.log('Movies found:', movies);
    res.json(movies);
  } catch (error: unknown) {
    console.error('Error searching movie:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch movie information', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch movie information', details: 'An unknown error occurred' });
    }
  }
});

// City suggestions route
router.get('/city-suggestions', async (req, res) => {
  const { query, country, region } = req.query;

  console.log('Received request for city suggestions:', { query, country, region }); // Log incoming request

  // Validate the query parameter
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query parameter' });
  }

  // Validate the country and region parameters
  if (country && typeof country !== 'string') {
    return res.status(400).json({ error: 'Invalid country parameter' });
  }

  if (region && typeof region !== 'string') {
    return res.status(400).json({ error: 'Invalid region parameter' });
  }

  try {
    // Check the cache for existing suggestions
    const cacheKey = `city-suggestions-${query}-${country}-${region}`;
    const cachedSuggestions = cache.get(cacheKey);

    if (cachedSuggestions) {
      console.log('Cache hit for key:', cacheKey); // Log cache hit
      return res.json(cachedSuggestions);
    } else {
      console.log('Cache miss for key:', cacheKey); // Log cache miss

      // Fetch city suggestions using OpenCage API
      const data = await opencage.geocode({ q: query, countrycode: country }); // Removed 'region' parameter

      if (data.status.code === 200 && data.results.length > 0) {
        const suggestions = data.results.map((place: { formatted: string; geometry: any; annotations: any }) => ({
          name: place.formatted,
          geometry: place.geometry,
          timezone: place.annotations.timezone.name,
        }));
        console.log('Fetched suggestions:', suggestions); // Log fetched suggestions
        cache.put(cacheKey, suggestions, 3600000); // Cache for 1 hour
        return res.json(suggestions);
      } else {
        console.log('Status', data.status.message);
        return res.status(404).json({ error: 'No results found' });
      }
    }
  } catch (error: unknown) {
    console.error('Error fetching city suggestions:', error); // Log error
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch city suggestions', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch city suggestions', details: 'An unknown error occurred' });
    }
  }
});

// Function to fetch city suggestions
async function getCitySuggestions(query: string, country: string, region: string) {
  // Define a type for the geocode result
  type GeocodeResult = {
    formattedAddress: string;
    country: string;
    // Add other properties as needed
  };

  // Use the geocoder to fetch city suggestions
  const params = {
    q: query,
    countrycode: country,
    region: region
  };

  try {
    const results = await geo.forwardGeocode(params) as GeocodeResult[]; // Cast the results to the defined type
    const suggestions = results.map((result: GeocodeResult) => ({
      name: result.formattedAddress,
      country: result.country, // Include country if needed
    }));
    return suggestions;
  } catch (error) {
    throw error;
  }
};

router.get('/weather-movie-recommendation', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    console.log('Received weather-movie-recommendation request:', { city, lat, lon });
    
    // Get weather data
    let weatherData;
    if (lat && lon) {
      console.log('Fetching weather data by coordinates');
      weatherData = await weatherApi.getCurrentWeatherByCoordinates(Number(lat), Number(lon));
    } else if (city) {
      console.log('Fetching weather data by city name');
      const cities = await weatherApi.getCurrentWeatherForMultipleCities(city as string);
      weatherData = cities[0]; // Use the first city in the list
    } else {
      throw new Error('City or coordinates are required');
    }
    console.log('Weather data:', JSON.stringify(weatherData, null, 2));

    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
      throw new Error('Invalid weather data received');
    }

    // Get movie recommendations based on weather
    console.log('Fetching movie recommendations for weather:', weatherData.weather[0].main);
    const movieRecommendations = await movieDbApi.getMovieRecommendations(weatherData.weather[0].main);
    console.log('Movie recommendations:', JSON.stringify(movieRecommendations, null, 2));

    const response = {
      weather: weatherData,
      movieRecommendations: movieRecommendations,
      recommendedGenre: getGenreFromWeather(weatherData.weather[0].main)
    };
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error: unknown) {
    console.error('Error in weather-movie-recommendation:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to get weather and movie recommendations', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to get weather and movie recommendations', details: 'An unknown error occurred' });
    }
  }
});

function getGenreFromWeather(weatherCondition: string): string {
  const genreMap: { [key: string]: string } = {
    Clear: 'Comedy',
    Clouds: 'Drama',
    Rain: 'Romance',
    Snow: 'Fantasy',
    Thunderstorm: 'Action',
  };
  return genreMap[weatherCondition] || 'Comedy';
}

// Remove the '/rate-movie' route as it's no longer needed

export default router;