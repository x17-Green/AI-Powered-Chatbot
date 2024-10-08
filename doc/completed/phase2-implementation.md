 # AI Movie Chatbot: Phase 2 Implementation - Frontend Development

This document provides a detailed, step-by-step guide to setting up the frontend for the AI Movie Chatbot project. Each step includes the files created, their purpose, and basic code snippets.

## 1. React with TypeScript Setup

1. Create a new React app with TypeScript in the client directory:
   ```
   npx create-react-app client --template typescript
   cd client
   ```
   Reason: This command creates a new React project with TypeScript support in the "client" folder.

2. Install additional dependencies:
   ```
   npm install axios framer-motion
   npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
   ```
   Reason: Axios is for making API calls, Framer Motion for animations, and Tailwind CSS for styling.

3. Initialize Tailwind CSS:
   ```
   npx tailwindcss init -p
   ```
   This creates `tailwind.config.js` and `postcss.config.js` files, which are necessary for Tailwind CSS configuration.

4. Update `tailwind.config.js`:
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
       "./public/index.html"
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```
   Reason: This configuration tells Tailwind CSS which files to scan for classes.

5. Create `src/index.css`:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   Reason: This file imports Tailwind's styles into our project.

6. Update `src/index.tsx`:
   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import './index.css';
   import App from './App';

   const root = ReactDOM.createRoot(
     document.getElementById('root') as HTMLElement
   );
   root.render(
     <React.StrictMode>
       <App />
     </React.StrictMode>
   );
   ```
   Reason: This is the entry point for our React application, now including Tailwind styles.

## 2. Implement Basic Chat Interface

1. Create `src/components/Chat.tsx`:
   ```typescript
   import React, { useState } from 'react';
   import { sendChatMessage } from '../services/api';

   interface ChatProps {
     onMovieSelect: (movie: any) => void;
   }

   const Chat: React.FC<ChatProps> = ({ onMovieSelect }) => {
     const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
     const [input, setInput] = useState('');

     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       if (input.trim()) {
         setMessages([...messages, { text: input, sender: 'user' }]);
         setInput('');
         try {
           const response = await sendChatMessage(input);
           setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
           
           // Check if the response contains movie information
           const movieTitleMatch = response.match(/.*"(.+)".*/);
           if (movieTitleMatch) {
             const movieTitle = movieTitleMatch[1];
             onMovieSelect(movieTitle);
           }
         } catch (error) {
           console.error('Error sending message:', error);
           setMessages(prev => [...prev, { text: "Sorry, I couldn't process your request.", sender: 'bot' }]);
         }
       }
     };

     return (
       <div className="bg-white rounded-lg shadow-xl overflow-hidden">
         {/* Chat UI components */}
       </div>
     );
   };

   export default Chat;
   ```
   Reason: This component handles the chat interface, including sending messages, displaying responses, and extracting movie titles from bot responses.

## 3. Create Movie Information Display Component

1. Create `src/components/MovieInfo.tsx`:
   ```typescript
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
     if (!movie) return null;

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
   ```
   Reason: This component displays detailed information about a selected movie, including its title, poster, overview, release date, and rating.

## 4. Set up API Service for Backend Communication

1. Create `src/services/api.ts`:
   ```typescript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:4444/api';

   export const sendChatMessage = async (message: string) => {
     const response = await axios.post(`${API_BASE_URL}/chat`, { message });
     return response.data.response;
   };

   export const searchMovie = async (title: string) => {
     const response = await axios.get(`${API_BASE_URL}/movie`, { params: { title } });
     return response.data;
   };

   export const getWeatherMovieRecommendation = async (city: string) => {
     const response = await axios.get(`${API_BASE_URL}/weather-movie-recommendation`, { params: { city } });
     return response.data;
   };
   ```
   Reason: This service handles API calls to our backend server, including sending chat messages, searching for movies, and getting weather-based movie recommendations.

## 5. Implement Main App Component with Tailwind CSS Styling

1. Update `src/App.tsx`:
   ```typescript
   import React, { useState } from 'react';
   import Chat from './components/Chat';
   import MovieInfo from './components/MovieInfo';
   import { searchMovie } from './services/api';

   const App: React.FC = () => {
     const [selectedMovie, setSelectedMovie] = useState(null);

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
   ```
   Reason: This main component brings together the Chat and MovieInfo components, applying Tailwind CSS classes for layout and styling. It also manages the state for the selected movie.

## 6. Update package.json Scripts

1. Ensure the following scripts are in `package.json`:
   ```json
   "scripts": {
     "start": "react-scripts start",
     "build": "react-scripts build",
     "test": "react-scripts test",
     "eject": "react-scripts eject"
   }
   ```
   Reason: These scripts allow us to run, build, and test our React application using simple commands.

## 7. Testing

1. Create a basic test file for the Chat component in `src/__tests__/Chat.test.tsx`:
   ```typescript
   import React from 'react';
   import { render, screen } from '@testing-library/react';
   import Chat from '../components/Chat';

   test('renders chat component', () => {
     render(<Chat onMovieSelect={() => {}} />);
     const chatElement = screen.getByRole('form');
     expect(chatElement).toBeInTheDocument();
   });
   ```
   Reason: This test ensures that the Chat component renders correctly.

2. Run tests using `npm test`.

## Next Steps

1. Implement error handling and loading states in the UI.
2. Add more advanced features like user authentication.
3. Optimize performance and implement caching where appropriate.
4. Conduct thorough testing of the integrated frontend and backend.

This completes the second phase of the project implementation. The frontend is now set up with a basic chat interface, movie information display, and styling using Tailwind CSS, integrated with the backend API.


## EXTRA FEATURES
1. ANIMATE THE WEATHER INFO
2. ADD CITY SUGGESTIONS UPON TYPING THE NAME
3. RETURNED REAL TIME WEATHER INFO SHOULD BE COMPARED WITH SIMILART CITIES OF SAME NAME.
4. THE RETURNED MOVIE IMAGE ON THE WEATHER DIV SHOULD BE CLICKABLE AND RETURN THE INFORMATION ON THE MOVIE DIV.
5. RETURNED WEATHER SHOULD BE THE ACTUAL CITY LOCATION SELECTED FROM THE SEARCH RESULT.