import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import MovieInfo from './components/MovieInfo';
import WeatherMovieRecommendation from './components/WeatherMovieRecommendation';
import Login from './components/Login';
import { searchMovie, getWeatherMovieRecommendation } from './services/api';
import { getCurrentUser, signOutUser } from './services/auth';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMoon, FaSun } from 'react-icons/fa';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [weatherRecommendation, setWeatherRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode ? JSON.parse(savedMode) : prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleMovieSelect = async (movieTitleOrMovie: string | Movie) => {
    if (typeof movieTitleOrMovie === 'string') {
      try {
        const movieData = await searchMovie(movieTitleOrMovie);
        if (movieData && movieData.length > 0) {
          setSelectedMovie(movieData[0]);
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
      }
    } else {
      setSelectedMovie(movieTitleOrMovie);
    }
  };

  const handleCitySubmit = async (city: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeatherMovieRecommendation(city);
      setWeatherRecommendation(data);
    } catch (error) {
      console.error('Error fetching weather-based recommendation:', error);
      setError('Failed to fetch weather-based recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(!isDarkMode));
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleLogin = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 flex justify-center items-center">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-darkBg text-darkText' : 'bg-white text-gray-900'}`}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme={isDarkMode ? 'dark' : 'light'}
      />
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Movie Chatbot</h1>
          <div className="flex items-center">
            {user && (
              <button
                onClick={handleSignOut}
                className="mr-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {isDarkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-700" />}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Chat onMovieSelect={handleMovieSelect} isDarkMode={isDarkMode} />
            <WeatherMovieRecommendation
              onCitySubmit={handleCitySubmit}
              onMovieClick={handleMovieSelect}
              recommendation={weatherRecommendation}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              isDarkMode={isDarkMode}
            />
          </div>
          <div>
            <MovieInfo 
              movie={selectedMovie} 
              onMovieSelect={setSelectedMovie} 
              isDarkMode={isDarkMode} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;