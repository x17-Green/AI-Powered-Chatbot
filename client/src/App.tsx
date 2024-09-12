import React, { useState } from 'react';
import Chat from './components/Chat';
import MovieInfo from './components/MovieInfo';
import WeatherMovieRecommendation from './components/WeatherMovieRecommendation';
import { searchMovie, getWeatherMovieRecommendation } from './services/api';

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [weatherRecommendation, setWeatherRecommendation] = useState<any>(null);

  const handleMovieSelect = async (movieTitle: string) => {
    try {
      const movieData = await searchMovie(movieTitle);
      setSelectedMovie(movieData);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  const handleWeatherRecommendation = async (city: string) => {
    try {
      const data = await getWeatherMovieRecommendation(city);
      setWeatherRecommendation(data);
    } catch (error) {
      console.error('Error fetching weather-based recommendation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Movie Chatbot</h1>
          <p className="text-blue-200">Discover, discuss, and get weather-based movie recommendations!</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Chat onMovieSelect={handleMovieSelect} />
          </div>
          <div className="space-y-8">
            <MovieInfo movie={selectedMovie} />
            <WeatherMovieRecommendation 
              onCitySubmit={handleWeatherRecommendation}
              recommendation={weatherRecommendation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;