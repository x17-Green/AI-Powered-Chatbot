import express from 'express';
import { geminiApi } from '../services/gemini';
import { movieDbApi } from '../services/moviedb';
import { weatherApi } from '../services/weather';

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

router.get('/weather-movie-recommendation', async (req, res) => {
  try {
    const { city } = req.query;
    if (typeof city !== 'string') {
      return res.status(400).json({ error: 'Invalid city parameter' });
    }
    const weatherData = await weatherApi.getCurrentWeather(city);
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    
    let movieGenre = 'action'; // default
    if (weatherCondition.includes('rain')) {
      movieGenre = 'drama';
    } else if (weatherCondition.includes('sun')) {
      movieGenre = 'comedy';
    }
    
    const movies = await movieDbApi.searchMovie(movieGenre);
    res.json({ weather: weatherData, movieRecommendations: movies.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather-based movie recommendation' });
  }
});

export default router;