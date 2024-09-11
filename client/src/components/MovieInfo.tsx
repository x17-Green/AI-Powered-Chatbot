import React from 'react';

interface Movie {
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

interface MovieInfoProps {
  movie: Movie | null;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movie }) => {
  if (!movie) return (
    <div className="bg-white rounded-lg shadow-xl p-6 h-full flex items-center justify-center">
      <p className="text-gray-500 text-center text-lg">Select a movie to see details</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-blue-600 p-4">
        <h2 className="text-xl font-semibold text-white">Movie Details</h2>
      </div>
      <div className="p-6 overflow-auto h-[500px]">
        <h3 className="text-2xl font-bold mb-4">{movie.title}</h3>
        {movie.poster_path && (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="w-full rounded-lg mb-4 shadow-md"
          />
        )}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Release Date</p>
          <p className="font-semibold">{movie.release_date}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Rating</p>
          <p className="font-semibold">{movie.vote_average}/10</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Overview</p>
          <p className="text-gray-800">{movie.overview}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieInfo;