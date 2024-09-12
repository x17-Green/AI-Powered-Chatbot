import React, { useState } from 'react';
import { searchMovie } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface MovieInfoProps {
  movie: Movie | null;
  onMovieSelect: (movie: Movie) => void;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onMovieSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
      <div className="bg-blue-600 p-4">
        <h2 className="text-xl font-semibold text-white">Movie Search</h2>
      </div>
      <div className="p-4 flex-grow flex flex-col overflow-hidden">
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <AnimatePresence>
          {movie && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow overflow-y-auto"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-2 text-center">{movie.title}</h2>
                {movie.poster_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                    alt={movie.title} 
                    className="w-32 h-48 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="w-full">
                  <p className="text-gray-700 mb-2 text-sm">{movie.overview}</p>
                  <p className="text-sm text-gray-600">Release Date: {movie.release_date}</p>
                  <p className="text-sm text-gray-600">Rating: {movie.vote_average}/10</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!movie && !isExpanded && (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-700 text-center">Search for a movie or ask the AI about one to see details here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;