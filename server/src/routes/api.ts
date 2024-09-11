import express from 'express';
import axios from 'axios';
// import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize TheMovieDB API
const MOVIEDB_API_KEY = process.env.MOVIEDB_API_KEY;
const MOVIEDB_BASE_URL = 'https://api.themoviedb.org/3';

// Function to generate AI response
const generateAIResponse = async (message: string) => {
  // Mock response for development
  return `This is a mock AI response to: "${message}". Here's information about the movie "Inception".`;
  
  // Commented out OpenAI code
  // const completion = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo",
  //   messages: [{ role: "user", content: message }],
  // });
  // return completion.choices[0].message.content;
};

// Function to search for a movie
const searchMovie = async (title: string) => {
  const response = await axios.get(`${MOVIEDB_BASE_URL}/search/movie`, {
    params: {
      api_key: MOVIEDB_API_KEY,
      query: title,
    },
  });

  if (response.data.results.length > 0) {
    const movie = response.data.results[0];
    return {
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    };
  }

  return null;
};

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await generateAIResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Error processing chat message' });
  }
});

router.get('/movie', async (req, res) => {
  try {
    const { title } = req.query;
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid title parameter' });
    }
    const movie = await searchMovie(title);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
    res.status(500).json({ error: 'Error fetching movie data' });
  }
});

export default router;