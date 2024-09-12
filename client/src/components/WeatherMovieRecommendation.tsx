import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherMovieRecommendationProps {
  onCitySubmit: (city: string) => void;
  recommendation: any;
  isLoading: boolean;
  error: string | null;
}

const WeatherMovieRecommendation: React.FC<WeatherMovieRecommendationProps> = ({ 
  onCitySubmit, 
  recommendation, 
  isLoading,
  error
}) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onCitySubmit(city);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      default: return '🌤️';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
      <div className="bg-blue-600 dark:bg-blue-800 p-4">
        <h2 className="text-xl font-semibold text-white">Weather-based Movie Recommendation</h2>
      </div>
      <div className="p-4 flex-grow flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="mb-4 flex-shrink-0">
          <div className="flex">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter city name..."
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Get Recommendations'}
            </button>
          </div>
        </form>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              className="text-red-500 mb-4 flex-shrink-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          {recommendation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-grow flex flex-col overflow-hidden"
            >
              <div className="mb-4 flex items-center flex-shrink-0">
                <span className="text-4xl mr-4">{getWeatherIcon(recommendation.weather.weather[0].main)}</span>
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">Current Weather</h3>
                  <p className="dark:text-gray-300">{recommendation.weather.weather[0].main}, {recommendation.weather.main.temp}°C</p>
                </div>
              </div>
              <div className="flex-grow overflow-auto">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Recommended Movies ({recommendation.recommendedGenre}):</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-4">
                  {recommendation.movieRecommendations.map((movie: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {movie.poster_path && (
                        <img 
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                          alt={movie.title}
                          className="w-full h-auto aspect-[2/3] object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm font-medium text-center dark:text-white line-clamp-2">{movie.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeatherMovieRecommendation;