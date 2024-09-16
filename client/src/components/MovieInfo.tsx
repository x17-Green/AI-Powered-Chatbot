import React, { useState, useEffect } from 'react';
import { searchMovie, rateMovie, getMovieRating } from '../services/api';
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

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onMovieSelect, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingStatus, setRatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (movie) {
      fetchMovieRating(movie.id);
    }
  }, [movie]);

  const fetchMovieRating = async (movieId: number) => {
    try {
      const { averageRating, userRating } = await getMovieRating(movieId);
      setAverageRating(averageRating);
      setUserRating(userRating);
    } catch (error) {
      console.error('Error fetching movie rating:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      setIsExpanded(true);
      try {
        const result = await searchMovie(searchTerm);
        if (result && result.length > 0) {
          onMovieSelect(result[0]);
        }
      } catch (error) {
        console.error('Error searching for movie:', error);
      }
      setIsSearching(false);
    }
  };

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

  const shareMovie = (platform: string) => {
    if (!movie) return;

    const movieTitle = encodeURIComponent(movie.title);
    const movieOverview = encodeURIComponent(movie.overview.slice(0, 100) + '...');
    const shareUrl = encodeURIComponent(window.location.href);

    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=Check out "${movieTitle}": ${movieOverview}&url=${shareUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=Check out "${movieTitle}": ${movieOverview} ${shareUrl}`;
        break;
    }

    window.open(shareLink, '_blank');
  };

  const handleRating = async (rating: number) => {
    if (movie) {
      setUserRating(rating);
      try {
        console.log(`Rating movie ${movie.id} with ${rating} stars`);
        await rateMovie(movie.id, rating);
        toast.success('Rating saved successfully!');
        // Refresh ratings
        await fetchMovieRating(movie.id);
      } catch (error) {
        console.error('Error rating movie:', error);
        toast.error('Failed to save rating. Please try again.');
      }
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full flex flex-col ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="bg-blue-600 dark:bg-blue-800 p-4">
        <h2 className="text-xl font-semibold text-white">Movie Information</h2>
      </div>
      <div className="p-4 flex-grow flex flex-col overflow-hidden">
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rating: {movie.vote_average}/10</p>
                </motion.div>
                {movie && (
                  <motion.div 
                    className="w-full mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold mb-2">Rate this movie:</h3>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`text-2xl ${
                            star <= (userRating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                          } hover:text-yellow-400 transition-colors duration-150`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                    {userRating !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                        Your Rating: {userRating} / 5
                      </p>
                    )}
                    {averageRating !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                        Average Rating: {averageRating.toFixed(1)} / 5
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
                  <h3 className="text-lg font-semibold mb-2">Share this movie:</h3>
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