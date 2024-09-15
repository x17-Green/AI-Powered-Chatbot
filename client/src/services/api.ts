import axios from 'axios';
// import config from '../config';
import { getDatabase, ref, push, set, get, query, orderByKey, limitToLast, runTransaction, endBefore } from "firebase/database";
import { app } from './firebase';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://your-back4app-container-url.back4app.io/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
console.log('API_BASE_URL:', API_BASE_URL);

const database = getDatabase(app);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const sendChatMessage = async (message: string) => {
  console.log(axiosInstance.post('/chat', { message }))
  const response = await axiosInstance.post('/chat', { message });
  return response.data.response;
};

export const searchMovie = async (title: string) => {
  console.log(`Searching for movie: ${title}`);
  try {
    const response = await axiosInstance.get('/movie', { params: { title } });
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error('Movie not found:', error);
        throw new Error('Movie not found. Please try a different title.');
      }
    }
    console.error('Error searching for movie:', error);
    throw new Error('An error occurred while searching for the movie.');
  }
};

export const getWeatherMovieRecommendation = async (city: string, lat?: number, lon?: number) => {
  const params: any = { city }; // Remove genre parameter
  if (lat !== undefined && lon !== undefined) {
    params.lat = lat;
    params.lon = lon;
  }
  const response = await axiosInstance.get('/weather-movie-recommendation', { params });
  return response.data;
};

export const rateMovie = async (movieId: number, rating: number) => {
  console.log(`Attempting to rate movie ${movieId} with rating ${rating}`);
  const movieRef = ref(database, `movieRatings/${movieId}`);
  try {
    await runTransaction(movieRef, (currentData: any) => {
      console.log('Current data:', currentData);
      if (currentData === null) {
        return { totalRating: rating, count: 1, userRating: rating };
      } else {
        return {
          totalRating: (currentData.totalRating || 0) + rating,
          count: (currentData.count || 0) + 1,
          userRating: rating // Always store the latest user rating
        };
      }
    });
    console.log('Rating saved successfully');
    return { message: 'Rating saved successfully' };
  } catch (error) {
    console.error('Error saving rating:', error);
    throw error;
  }
};

export const getMovieRating = async (movieId: number) => {
  console.log(`Fetching rating for movie ${movieId}`);
  const movieRef = ref(database, `movieRatings/${movieId}`);
  try {
    const snapshot = await get(movieRef);
    console.log('Snapshot:', snapshot.val());
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        averageRating: data.count > 0 ? data.totalRating / data.count : null,
        userRating: data.userRating || null
      };
    }
    return { averageRating: null, userRating: null };
  } catch (error) {
    console.error('Error fetching rating:', error);
    throw error;
  }
};

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export const saveChatMessage = async (message: Message) => {
  const chatRef = ref(database, 'chatHistory');
  await push(chatRef, message);
};

export const getChatHistory = async (limit: number = 50, lastKey?: string): Promise<{ messages: Message[], lastKey: string | null }> => {
  const chatRef = ref(database, 'chatHistory');
  let chatQuery = query(chatRef, orderByKey(), limitToLast(limit));
  if (lastKey) {
    chatQuery = query(chatQuery, endBefore(lastKey));
  }
  const snapshot = await get(chatQuery);
  if (snapshot.exists()) {
    const messages = Object.entries(snapshot.val()).map(([key, value]) => ({
      ...(value as Message),
      id: key
    }));
    return {
      messages: messages.reverse(),
      lastKey: messages[0].id
    };
  }
  return { messages: [], lastKey: null };
};

export const clearChatHistory = async () => {
  const chatRef = ref(database, 'chatHistory');
  await set(chatRef, null);
};

export const fetchCitySuggestions = async (input: string) => {
  try {
    const response = await axiosInstance.get(`/city-suggestions?query=${input}`);
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    throw new Error('Failed to fetch city suggestions. Please try again.');
  }
};

export const getMovieRecommendationsByLocation = async (location: string) => {
  try {
    const response = await axiosInstance.get(`/movie-recommendations`, { params: { location } });
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw new Error('Failed to fetch movie recommendations. Please try again.');
  }
};