import React, { useState } from 'react';
import Chat from './components/Chat';
import MovieInfo from './components/MovieInfo';
import { searchMovie } from './services/api';

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleMovieSelect = async (movieTitle: string) => {
    try {
      const movieData = await searchMovie(movieTitle);
      setSelectedMovie(movieData);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Movie Chatbot</h1>
          <p className="text-blue-200">Discover and discuss your favorite films with AI assistance</p>
        </header>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <Chat onMovieSelect={handleMovieSelect} />
          </div>
          <div className="w-full lg:w-1/3">
            <MovieInfo movie={selectedMovie} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;