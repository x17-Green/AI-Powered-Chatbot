import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeatherMovieRecommendation, fetchCitySuggestions } from '../services/api';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface WeatherMovieRecommendationProps {
  onCitySubmit: (city: string) => void;
  onMovieClick: (movie: Movie) => void;
  recommendation: any;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  isDarkMode: boolean;
  isChatExpanded: boolean;
}

interface Weather {
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  humidity: number;
}

interface Sys {
  country: string;
}

interface MovieRecommendation {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface LocalRecommendation {
  weather: Weather[];
  main: Main;
  sys: Sys;
  movieRecommendations: MovieRecommendation[];
  recommendedGenre: string;
  cityName: string;
  country: string;
}

const WeatherMovieRecommendation: React.FC<WeatherMovieRecommendationProps> = ({ 
  onCitySubmit, 
  onMovieClick, 
  recommendation, 
  isLoading,
  setIsLoading,
  error: propError,
  isDarkMode,
  isChatExpanded
}) => {
  const [city, setCity] = useState('');
  const [multipleCities, setMultipleCities] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [localRecommendation, setLocalRecommendation] = useState<LocalRecommendation | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCity(inputValue);

    if (inputValue) {
      try {
        const suggestions = await fetchCitySuggestions(inputValue);
        setCitySuggestions(suggestions);
        setErrorMessage(null);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
        setCitySuggestions([]);
        setErrorMessage('Failed to fetch city suggestions. Please try again.');

        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    } else {
      setCitySuggestions([]);
      setErrorMessage(null);
    }
  };

  const handleCitySelect = async (cityName: string, geometry: any) => {
    setCity(cityName);
    setCitySuggestions([]);
    setSelectedLocation(cityName);

    try {
      const result = await getWeatherMovieRecommendation(cityName, geometry.lat, geometry.lng);
      onCitySubmit(cityName);
      setLocalRecommendation(result);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      setIsLoading(true);
      setSelectedCity(null);
      setError(null);
      try {
        const result = await getWeatherMovieRecommendation(city);
        if (Array.isArray(result.weather) && result.weather.length > 1) {
          setMultipleCities(result.weather.slice(0, 2));
          setLocalRecommendation(null);
        } else {
          setMultipleCities([]);
          setLocalRecommendation({
            ...result,
            cityName: city,
            country: result.sys.country
          });
          setSelectedCity(city);
          onCitySubmit(city);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to fetch weather data. Please try again.');
      } finally {
        setIsLoading(false);
      }
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

  const renderWeatherInfo = (weather: any) => {
    if (!weather || !weather.weather || !weather.weather[0]) {
      return <p>Weather information not available</p>;
    }

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-300 dark:from-blue-700 dark:to-blue-500 p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center">
          <motion.span 
            className="text-5xl mr-4"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {getWeatherIcon(weather.weather[0].main)}
          </motion.span>
          <div>
            <h3 className="text-xl font-bold text-white">{localRecommendation?.cityName}</h3>
            <p className="text-white">{weather.weather[0].main}, {Math.round(weather.main.temp)}°C</p>
            <p className="text-sm text-white opacity-75">{localRecommendation?.country}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white">Humidity: {weather.main.humidity}%</p>
          <p className="text-white">Wind: {weather.wind.speed} m/s</p>
        </div>
      </div>
    );
  };

  const displayRecommendation = localRecommendation || recommendation;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isChatExpanded ? 'h-full' : 'h-auto min-h-[calc(100vh-12rem)]'}`}>
      <div className="bg-blue-600 dark:bg-blue-800 p-4">
        <h2 className="text-xl font-semibold text-white">Weather-based Movie Recommendation</h2>
      </div>
      <div className="p-4 flex-grow flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="mb-4 flex-shrink-0 relative">
          <div className="flex">
            <input
              type="text"
              value={city}
              onChange={handleCityChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && citySuggestions.length > 0) {
                  handleCitySelect(citySuggestions[0].name, citySuggestions[0].geometry);
                }
              }}
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
          {citySuggestions.length > 0 && (
            <ul className="absolute bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 max-h-60 overflow-auto z-10 w-full">
              {citySuggestions.map((suggestion, index) => (
                <li 
                  key={index} 
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                  onClick={() => handleCitySelect(suggestion.name, suggestion.geometry)}
                >
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          )}
        </form>
        
        <div className="flex-grow overflow-auto">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                Loading...
              </motion.div>
            )}
            {(error || propError) && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-center py-4"
              >
                {error || propError}
              </motion.div>
            )}
            
            {multipleCities.length > 0 && (
              <motion.div
                key="multiple-cities"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                <h3 className="text-lg font-semibold mb-2">Multiple cities found. Please select one:</h3>
                <ul className="list-disc pl-5">
                  {multipleCities.map((city, index) => (
                    <li key={index} className="mb-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 font-semibold"
                        onClick={() => handleCitySelect(city.name, city.geometry)}
                      >
                        {city.name}, {city.sys.country}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            
            {selectedCity && (
              <motion.div
                key="selected-city"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 text-sm text-gray-600 italic"
              >
                Showing recommendations for {selectedCity}
              </motion.div>
            )}
            
            {displayRecommendation && (
              <motion.div
                key="recommendation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col"
              >
                <div className="mb-4">
                  {renderWeatherInfo(displayRecommendation.weather)}
                </div>
                {displayRecommendation.movieRecommendations && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Recommended Movies ({displayRecommendation.recommendedGenre}):</h3>
                    <div className={`grid gap-4 pb-4 ${
                      isChatExpanded 
                        ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4' 
                        : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                    }`}>
                      {displayRecommendation.movieRecommendations.map((movie: any, index: number) => (
                        <motion.div 
                          key={index} 
                          className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex flex-col items-center cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onMovieClick(movie)}
                        >
                          {movie.poster_path && (
                            <div className="w-full pb-[150%] relative mb-2 overflow-hidden rounded-lg">
                              <img 
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                                alt={movie.title}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <p className="text-sm font-medium text-center dark:text-white line-clamp-2 h-10">{movie.title}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const randomizeMovies = (movies: MovieRecommendation[]) => {
  for (let i = movies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [movies[i], movies[j]] = [movies[j], movies[i]];
  }
  return movies;
};

export default WeatherMovieRecommendation;