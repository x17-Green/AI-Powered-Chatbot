# AI Movie Chatbot: First Step Implementation

This document provides a detailed, step-by-step guide to setting up the initial backend for the AI Movie Chatbot project. Each step includes the files created, their purpose, and basic code snippets.

## 1. Project Setup

1. Create a new directory for the project:
   ```
   mkdir AI-Powered-Chatbot
   cd AI-Powered-Chatbot
   ```
   Reason: This creates a dedicated space for our project.

2. Create subdirectories for backend and frontend:
   ```
   mkdir server client
   ```
   Reason: Separates backend (server) and frontend (client) code for better organization.

3. Initialize a new Node.js project in the server directory:
   ```
   cd server
   npm init -y
   ```
   This creates a `package.json` file, which will manage our project dependencies.

4. Create a `.gitignore` file in the root directory:
   ```
   touch .gitignore
   ```
   Add the following content:
   ```
   node_modules/
   .env
   .env.test
   ```
   Reason: Prevents sensitive information and unnecessary files from being tracked by git.

## 2. Backend Setup

1. Install necessary dependencies:
   ```
   npm install express mongoose cors dotenv axios
   npm install --save-dev typescript @types/express @types/node @types/cors ts-node nodemon
   ```
   Reason: These packages provide the foundation for our server, database connection, and API integrations.

2. Create a `tsconfig.json` file in the server directory:
   ```json
   {
     "compilerOptions": {
       "target": "es6",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true
     }
   }
   ```
   Reason: Configures TypeScript compilation settings.

3. Create `src/server.ts`:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import connectDB from './database';
   import apiRoutes from './routes/api';

   dotenv.config();
   const app = express();
   const port = process.env.PORT || 3000;

   connectDB();
   app.use(cors());
   app.use(express.json());
   app.use('/api', apiRoutes);

   app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
   });
   ```
   Reason: This is the main entry point for our server application.

4. Create `src/database.ts`:
   ```typescript
   import mongoose from 'mongoose';
   import dotenv from 'dotenv';

   dotenv.config();

   const connectDB = async () => {
     try {
       await mongoose.connect(process.env.MONGODB_URI as string);
       console.log('MongoDB connected successfully');
     } catch (error) {
       console.error('MongoDB connection error:', error);
       process.exit(1);
     }
   };

   export default connectDB;
   ```
   Reason: Handles the connection to our MongoDB database.

5. Create `src/routes/api.ts`:
   ```typescript
   import express from 'express';
   const router = express.Router();

   router.get('/chat', (req, res) => {
     res.json({ message: 'Chat endpoint' });
   });

   router.get('/movie', (req, res) => {
     res.json({ message: 'Movie endpoint' });
   });

   export default router;
   ```
   Reason: Defines the API routes for our application.

## 3. External API Integrations

1. Create `src/services/openai.ts`:
   ```typescript
   import axios from 'axios';
   import dotenv from 'dotenv';

   dotenv.config();

   const openaiApi = axios.create({
     baseURL: 'https://api.openai.com/v1',
     headers: {
       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
       'Content-Type': 'application/json'
     }
   });

   export const generateChatResponse = async (message: string) => {
     try {
       const response = await openaiApi.post('/chat/completions', {
         model: 'gpt-3.5-turbo',
         messages: [{ role: 'user', content: message }]
       });
       return response.data.choices[0].message.content;
     } catch (error) {
       console.error('OpenAI API error:', error);
       throw new Error('Failed to generate chat response');
     }
   };
   ```
   Reason: Handles interactions with the OpenAI API for generating chat responses.

2. Create `src/services/moviedb.ts`:
   ```typescript
   import axios from 'axios';
   import dotenv from 'dotenv';

   dotenv.config();

   const movieDbApi = axios.create({
     baseURL: 'https://api.themoviedb.org/3',
     params: {
       api_key: process.env.MOVIEDB_API_KEY
     }
   });

   export const searchMovie = async (query: string) => {
     try {
       const response = await movieDbApi.get('/search/movie', {
         params: { query }
# AI Movie Chatbot: First Step Implementation

This document outlines the initial implementation steps for the AI Movie Chatbot project. We've completed the backend setup and basic API integrations.

## 1. Project Setup

1. Created a new directory for the project called "AI-Powered-Chatbot".
2. Inside this directory, created two subdirectories: "server" for backend and "client" for frontend (to be implemented later).
3. Initialized a new Node.js project in the "server" directory by running `npm init -y`.
4. Created a `.gitignore` file to exclude node_modules and environment files from version control.

## 2. Backend Setup

1. Installed necessary dependencies:
   - Express.js: A web application framework for Node.js
   - TypeScript: A typed superset of JavaScript
   - Mongoose: An Object Data Modeling (ODM) library for MongoDB
   - Cors: Middleware to enable Cross-Origin Resource Sharing
   - Dotenv: To load environment variables from a .env file
   - Axios: A promise-based HTTP client for making API requests

2. Created a `tsconfig.json` file to configure TypeScript settings.

3. Set up the main server file (`server.ts`):
   - Imported necessary modules
   - Created an Express application
   - Set up middleware (cors, json parsing)
   - Defined a basic route to check if the server is running
   - Set up the server to listen on a specified port

4. Implemented database connection:
   - Created a `database.ts` file to handle MongoDB connection
   - Used Mongoose to establish a connection to the database
   - Implemented functions to connect and disconnect from the database

5. Set up API routes:
   - Created an `api.ts` file in the `routes` directory
   - Defined basic routes for chat and movie endpoints

## 3. External API Integrations

1. OpenAI GPT Integration:
   - Created an `openai.ts` file in the `services` directory
   - Implemented a function to make requests to the OpenAI API
   - Set up error handling for API calls

2. TheMovieDB Integration:
   - Created a `moviedb.ts` file in the `services` directory
   - Implemented a function to search for movies using TheMovieDB API
   - Set up error handling for API calls

## 4. Environment Configuration

1. Created a `.env` file to store sensitive information:
   - MongoDB connection string
   - API keys for OpenAI and TheMovieDB
   - Port number for the server

2. Created a `.env.test` file with similar structure but using test-specific values.

## 5. Testing Setup

1. Installed testing dependencies:
   - Jest: A JavaScript testing framework
   - Supertest: A library for testing HTTP assertions

2. Created a `jest.config.js` file to configure Jest for TypeScript.

3. Implemented test files for each major component:
   - `server.test.ts`: Tests for the Express server setup
   - `database.test.ts`: Tests for database connection
   - `openai.test.ts`: Tests for OpenAI service
   - `moviedb.test.ts`: Tests for TheMovieDB service
   - `env.test.ts`: Tests for environment variable configuration

4. Updated `package.json` with scripts to run tests.

## 6. Logging

1. Created a `logger.ts` file in the `utils` directory to handle logging.
2. Implemented basic log and error functions that respect the current environment (production vs test).

## Next Steps

1. Implement the frontend using React with TypeScript.
2. Create a basic chat interface.
3. Implement movie information display component.
4. Set up API service for frontend-backend communication.
5. Apply styling using Tailwind CSS.

This completes the first phase of the project setup. The backend is now ready with basic functionality and integrations, and a comprehensive test suite is in place.