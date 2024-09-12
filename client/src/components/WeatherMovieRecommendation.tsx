import React, { useState } from 'react';

interface WeatherMovieRecommendationProps {
  onCitySubmit: (city: string) => void;
  recommendation: any;
}

const WeatherMovieRecommendation: React.FC<WeatherMovieRecommendationProps> = ({ onCitySubmit, recommendation }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onCitySubmit(city);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-blue-600 p-4">
        <h2 className="text-xl font-semibold text-white">Weather-based Movie Recommendation</h2>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-grow border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city name..."
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Recommendation
            </button>
          </div>
        </form>
        {recommendation && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Weather: {recommendation.weather.weather[0].main}</h3>
            <p className="mb-4">Temperature: {recommendation.weather.main.temp}°C</p>
            <h3 className="text-lg font-semibold mb-2">Recommended Movies:</h3>
            <ul className="list-disc pl-5">
              {recommendation.movieRecommendations.map((movie: any, index: number) => (
                <li key={index} className="mb-1">{movie.title}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherMovieRecommendation;