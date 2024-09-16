import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import MovieInfo from './components/MovieInfo';
import WeatherMovieRecommendation from './components/WeatherMovieRecommendation';
import Login from './components/Login';
import { searchMovie, getWeatherMovieRecommendation } from './services/api';
import { getCurrentUser, signOutUser } from './services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMoon, FaSun, FaComments, FaTimes, FaBars, FaSignOutAlt } from 'react-icons/fa';

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
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
        toast.error('Failed to authenticate user. Please try logging in again.');
        setUser(null);
      }
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
    try {
      await signOutUser();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Failed to log in. Please try again.');
    }
  };

  const toggleChat = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">AI Movie Chatbot</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleChat}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                aria-label={isChatExpanded ? "Collapse chat" : "Expand chat"}
              >
                {isChatExpanded ? <FaTimes /> : <FaComments />}
              </button>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label="Sign out"
                >
                  <FaSignOutAlt />
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`space-y-8 flex flex-col transition-all duration-300 ease-in-out ${isChatExpanded ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
            <AnimatePresence>
              {isChatExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Chat onMovieSelect={handleMovieSelect} isDarkMode={isDarkMode} />
                </motion.div>
              )}
            </AnimatePresence>
            <WeatherMovieRecommendation
              onCitySubmit={handleCitySubmit}
              onMovieClick={handleMovieSelect}
              recommendation={weatherRecommendation}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              error={error}
              isDarkMode={isDarkMode}
              isChatExpanded={isChatExpanded}
            />
          </div>
          <div className="flex flex-col">
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