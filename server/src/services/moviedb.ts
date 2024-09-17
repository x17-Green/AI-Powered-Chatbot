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
    },
    getMovieRecommendations: async (weatherCondition: string) => {
      try {
        console.log(`Getting movie recommendations for weather: ${weatherCondition}`);
        // Map weather conditions to genre IDs
        const genreMap: { [key: string]: number } = {
          Clear: 35, // Comedy
          Clouds: 18, // Drama
          Rain: 10749, // Romance
          Snow: 14, // Fantasy
          Thunderstorm: 28, // Action
        };

        const genreId = genreMap[weatherCondition] || 35; // Default to Comedy if weather condition not found
        console.log(`Mapped genre ID: ${genreId}`);

        const response = await api.get('/discover/movie', {
          params: {
            with_genres: genreId,
            sort_by: 'popularity.desc',
            page: 1
          }
        });
        console.log('MovieDB API response:', JSON.stringify(response.data, null, 2));

        return response.data.results.slice(0, 10); // Return top 10 movies
      } catch (error) {
        console.error('Error fetching movie recommendations:', error);
        throw new Error('Failed to fetch movie recommendations');
      }
    }
  };
};

export const movieDbApi = createMovieDbApi();