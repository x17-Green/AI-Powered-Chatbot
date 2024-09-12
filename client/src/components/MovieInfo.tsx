import React, { useState, useRef, useEffect } from 'react';
import { searchMovie } from '../services/api';

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
  const movieInfoRef = useRef<null | HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
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

  useEffect(() => {
    if (movieInfoRef.current) {
      const baseHeight = 100; // Height of search bar and padding
      const contentHeight = movie ? 400 : 0; // Estimated height of movie content
      const height = Math.min(baseHeight + contentHeight, 600);
      movieInfoRef.current.style.height = `${height}px`;
    }
  }, [movie]);

  return (
    <div 
      ref={movieInfoRef}
      className="bg-white rounded-lg shadow-xl p-6 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
      style={{ minHeight: '100px', maxHeight: '600px' }}
    >
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for a movie..."
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div className="flex-grow overflow-auto">
        {movie ? (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-center">{movie.title}</h2>
            {movie.poster_path && (
              <div className="w-48 h-72 mb-4 overflow-hidden rounded-lg shadow-md">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full">
              <p className="text-gray-700 mb-2 text-sm">{movie.overview}</p>
              <p className="text-sm text-gray-600">Release Date: {movie.release_date}</p>
              <p className="text-sm text-gray-600">Rating: {movie.vote_average}/10</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-700 text-center">Search for a movie or ask the AI about one to see details here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;