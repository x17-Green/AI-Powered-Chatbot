import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const createMovieDbApi = (axiosInstance?: AxiosInstance) => {
  const api = axiosInstance || axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    params: {
      api_key: process.env.MOVIEDB_API_KEY
    }
  });

  return {
    searchMovie: async (query: string) => {
      try {
        const response = await api.get('/search/movie', {
          params: { query }
        });
        if (response.data.status_code === 7 || response.data.status_code === 401) {
          throw new Error('Invalid API key');
        }
        return response.data.results;
      } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.data?.status_code === 7)) {
          throw new Error('Invalid API key');
        }
        if (error.message === 'Invalid API key') {
          throw error;
        }
        console.error('MovieDB API error:', error);
        throw new Error('Failed to search for movie');
      }
    }
  };
};

export const movieDbApi = createMovieDbApi();