import React, { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import MovieInfo from './components/MovieInfo';
import WeatherMovieRecommendation from './components/WeatherMovieRecommendation';
import Login from './components/Login';
import { searchMovie, getWeatherMovieRecommendation } from './services/api';
import { getCurrentUser, signOutUser } from './services/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { app as firebaseApp } from './services/firebase';

console.log("Firebase app:", firebaseApp);

interface Movie {
  id: number;  // Add this line
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
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      const height = window.innerHeight - 200; // Adjust this value as needed
      chatContainerRef.current.style.height = `${height}px`;
    }
  }, [isChatOpen]);

  const handleMovieSelect = async (movieTitle: string) => {
    try {
      const movieData = await searchMovie(movieTitle);
      if (movieData && movieData.length > 0) {
        setSelectedMovie(movieData[0]);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  const handleWeatherRecommendation = async (city: string) => {
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

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = () => {
    setUser(getCurrentUser());
  };

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 flex justify-center items-center">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gradient-to-br from-blue-800 to-indigo-900 flex flex-col`}>
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-200"
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <button
        onClick={handleLogout}
        className="fixed top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition duration-200"
      >
        Logout
      </button>
      <div className="container mx-auto max-w-7xl flex-grow flex flex-col p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Movie Chatbot</h1>
          <p className="text-blue-200">Discover, discuss, and get weather-based movie recommendations!</p>
        </header>
        <div className="flex-grow flex flex-col lg:flex-row gap-8 relative">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                ref={chatContainerRef}
                className="lg:w-1/2 flex-shrink-0"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'sticky',
                  top: '1rem',
                  overflowY: 'auto',
                }}
              >
                <Chat onMovieSelect={handleMovieSelect} />
              </motion.div>
            )}
          </AnimatePresence>
          <div className={`flex-grow flex flex-col gap-8 ${isChatOpen ? 'lg:w-1/2' : 'w-full'}`}>
            <div className="flex-grow bg-white rounded-lg shadow-xl overflow-hidden">
              <WeatherMovieRecommendation 
                onCitySubmit={handleWeatherRecommendation}
                onMovieClick={handleMovieClick}
                recommendation={weatherRecommendation}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
              />
            </div>
            <div className="flex-grow bg-white rounded-lg shadow-xl overflow-hidden">
              <MovieInfo movie={selectedMovie} onMovieSelect={setSelectedMovie} />
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-blue-900 to-transparent pointer-events-none">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600 transition duration-200 pointer-events-auto float-right"
        >
          {isChatOpen ? 'Close Chat' : 'Chat with AI'}
        </button>
      </div>
      <ToastContainer position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </div>
  );
};

export default App;