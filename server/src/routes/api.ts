import express from 'express';
import { geminiApi } from '../services/gemini';
import { movieDbApi } from '../services/moviedb';
import { weatherApi } from '../services/weather';
import cache from 'memory-cache';
import geocoder from 'node-geocoder';
import dotenv from 'dotenv';
import opencage from 'opencage-api-client'; // Import the OpenCage API client

dotenv.config();

// Set up the geocoder
const options = {
  provider: 'opencage',
  apiKey: process.env.OPENCAGE_API_KEY, // Replace with your actual API key
  formatter: null
};

const geo = geocoder(options);

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await geminiApi.generateChatResponse(message);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

router.get('/movie', async (req, res) => {
  try {
    const { title } = req.query;
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title parameter' });
    }
    const movies = await movieDbApi.searchMovie(title);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie information' });
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
  } catch (error) {
    console.error('Error fetching city suggestions:', error); // Log error
    res.status(500).json({ error: 'Failed to fetch city suggestions' });
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
    if (typeof city !== 'string') {
      return res.status(400).json({ error: 'Invalid city parameter' });
    }

    let weatherData;
    if (lat && lon) {
      // If lat and lon are provided, get weather for specific coordinates
      weatherData = await weatherApi.getCurrentWeatherByCoordinates(Number(lat), Number(lon));
    } else {
      // Otherwise, get weather for multiple cities with the same name
      weatherData = await weatherApi.getCurrentWeatherForMultipleCities(city);
    }

    // If multiple cities are found, return the list without movie recommendations
    if (Array.isArray(weatherData) && weatherData.length > 1) {
      return res.json({ weather: weatherData });
    }

    // Use the first (or only) city's weather for movie recommendations
    const primaryWeather = Array.isArray(weatherData) ? weatherData[0] : weatherData;
    const weatherCondition = primaryWeather.weather[0].main.toLowerCase();
    
    let movieGenre = 'action'; // default
    if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
      movieGenre = 'drama';
    } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
      movieGenre = 'comedy';
    } else if (weatherCondition.includes('cloud')) {
      movieGenre = 'mystery';
    } else if (weatherCondition.includes('snow')) {
      movieGenre = 'romance';
    }
    
    const movies = await movieDbApi.searchMovie(movieGenre);
    res.json({ 
      weather: primaryWeather, 
      movieRecommendations: movies.slice(0, 5),
      recommendedGenre: movieGenre
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather-based movie recommendation' });
  }
});

// Remove the '/rate-movie' route as it's no longer needed

export default router;