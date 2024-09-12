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
  if (!movie) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">No Movie Selected</h2>
        <p className="text-gray-700">Ask the AI about a movie to see details here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">{movie.title}</h2>
      {movie.poster_path && (
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          className="w-full rounded-lg mb-4"
        />
      )}
      <p className="text-gray-700 mb-2">{movie.overview}</p>
      <p className="text-sm text-gray-600">Release Date: {movie.release_date}</p>
      <p className="text-sm text-gray-600">Rating: {movie.vote_average}/10</p>
    </div>
  );
};

export default MovieInfo;