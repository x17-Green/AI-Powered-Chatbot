import React, { useState, useEffect } from 'react';
import { searchMovie, getMovieRating } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTwitter, FaFacebook, FaWhatsapp, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface MovieInfoProps {
  movie: Movie | null;
  onMovieSelect: (movie: Movie | null) => void;
  isDarkMode: boolean;
}

const SkeletonLoader = () => (
  <div className="animate-pulse flex flex-col items-center">
    <div className="bg-gray-300 dark:bg-gray-600 w-48 h-8 mb-2 rounded"></div>
    <div className="bg-gray-300 dark:bg-gray-600 w-32 h-48 md:w-48 md:h-72 mb-2 rounded"></div>
    <div className="w-full space-y-2">
      <div className="bg-gray-300 dark:bg-gray-600 w-full h-4 rounded"></div>
      <div className="bg-gray-300 dark:bg-gray-600 w-full h-4 rounded"></div>
      <div className="bg-gray-300 dark:bg-gray-600 w-3/4 h-4 rounded"></div>
    </div>
  </div>
);

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onMovieSelect, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [movieSuggestions, setMovieSuggestions] = useState<Movie[]>([]);

  useEffect(() => {
    if (movie) {
      fetchMovieRating(movie.id);
    }
  }, [movie]);

  const fetchMovieRating = async (movieId: number) => {
    try {
      const { averageRating, userRating } = await getMovieRating(movieId);
      setRating(userRating || averageRating);
    } catch (error) {
      toast.error('Failed to fetch movie rating.');
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      setIsSearching(true);
      try {
        const result = await searchMovie(value);
        setMovieSuggestions(result);
      } catch (error) {
        console.error('Error fetching movie suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setMovieSuggestions([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSuggestionClick = (suggestion: Movie) => {
    onMovieSelect(suggestion);
    setSearchTerm(suggestion.title);
    setMovieSuggestions([]);
  };

  const handleRating = (star: number) => {
    setRating(star);
  };

  const shareMovie = (platform: string) => {
    const shareUrl = `https://www.example.com/movies/${movie?.id}`;
    const message = `Check out this movie: ${movie?.title}`;
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)} ${encodeURIComponent(shareUrl)}`);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`bg-cover bg-center rounded-lg shadow-xl overflow-hidden h-full flex flex-col ${isDarkMode ? 'text-darkText bg-darkBg' : 'text-gray-900 bg-white'}`}
      style={{
        backgroundImage: movie ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` : 'none',
      }}
    >
      <div className="bg-blue-600 dark:bg-blue-800 p-4 bg-opacity-75">
        <h2 className="text-xl font-semibold text-white">Movie Information</h2>
      </div>
      <div className="p-4 flex-grow flex flex-col overflow-hidden bg-opacity-75 bg-gray-800">
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0">
          <div className="flex relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search for a movie..."
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <AnimatePresence>
              {movieSuggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{ top: '100%', left: 0 }}
                >
                  {movieSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      {suggestion.title}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow overflow-y-auto"
            >
              <SkeletonLoader />
            </motion.div>
          ) : movie ? (
            <motion.div
              key="movie-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow overflow-y-auto"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-2 text-center">{movie.title}</h2>
                {movie.poster_path && (
                  <motion.img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title} 
                    className="w-48 h-72 object-cover rounded-lg mb-4 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <motion.div 
                  className="w-full bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <p className="mb-2">{movie.overview}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Release Date: {movie.release_date}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating: {rating ? `${rating}/10` : 'N/A'}</p>
                </motion.div>
                {movie && (
                  <motion.div 
                    className="w-full mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-center">Rate this movie:</h3>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`text-2xl ${
                            star <= (rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          } hover:text-yellow-400 transition-colors duration-150`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                    {rating !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                        Your Rating: {rating} / 5
                      </p>
                    )}
                  </motion.div>
                )}
                <motion.div 
                  className="w-full mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold mb-2 text-center">Share this movie:</h3>
                  <div className="flex justify-center space-x-4">
                    <button onClick={() => shareMovie('twitter')} className="text-blue-400 hover:text-blue-600">
                      <FaTwitter size={24} />
                    </button>
                    <button onClick={() => shareMovie('facebook')} className="text-blue-600 hover:text-blue-800">
                      <FaFacebook size={24} />
                    </button>
                    <button onClick={() => shareMovie('whatsapp')} className="text-green-500 hover:text-green-700">
                      <FaWhatsapp size={24} />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-movie"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex items-center justify-center"
            >
              <p className="text-center">Search for a movie or ask the AI about one to see details here!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MovieInfo;