# AI Movie Chatbot

## Table of Contents
- [AI Movie Chatbot](#ai-movie-chatbot)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Installation Guide](#installation-guide)
    - [Prerequisites](#prerequisites)
    - [Steps to Install](#steps-to-install)
  - [Configuration](#configuration)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
    - [Backend API Endpoints](#backend-api-endpoints)
  - [Testing](#testing)
  - [Contributing](#contributing)
  - [License](#license)

## Introduction
The AI Movie Chatbot is a web application that allows users to discover, discuss, and receive weather-based movie recommendations through an interactive chat interface. The application leverages the OpenAI API for natural language processing and TheMovieDB API for movie data.

## Features
- Chat interface for user interaction
- Movie search functionality
- Weather-based movie recommendations
- User authentication with Firebase
- Responsive design using Tailwind CSS
- Animated UI components with Framer Motion

## Technologies Used
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, MongoDB, Firebase
- **APIs**: OpenAI API, TheMovieDB API, OpenWeatherMap API, OpenCage Geocoder API, Google Gemini API
- **Testing**: Jest, React Testing Library

## Installation Guide

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (for local development) or a MongoDB Atlas account
- Firebase account for authentication

### Steps to Install

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-movie-chatbot.git
   cd ai-movie-chatbot
   ```

2. **Set up the backend**
   - Navigate to the `server` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `server` directory and add your environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     OPENAI_API_KEY=your_openai_api_key
     MOVIEDB_API_KEY=your_moviedb_api_key
     PORT=4444
     ```

3. **Set up the frontend**
   - Navigate to the `client` directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run the backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Run the frontend application**
   ```bash
   cd client
   npm start
   ```

## Configuration
- Ensure that your MongoDB connection string is correctly set in the `.env` file.
- Set up Firebase authentication methods in the Firebase Console and update your client-side code to handle authentication.

## Usage
- Open your browser and navigate to `http://localhost:3000` to access the application.
- Users can log in using Firebase authentication, interact with the chatbot, search for movies, and receive recommendations based on the weather.

## API Endpoints
### Backend API Endpoints
- **POST /api/chat**: Send a chat message to the AI and receive a response.
- **GET /api/movie**: Search for a movie by title.
- **GET /api/weather-movie-recommendation**: Get movie recommendations based on the weather in a specified city.

## Testing
- To run tests for the backend:
  ```bash
  cd server
  npm test
  ```
- To run tests for the frontend:
  ```bash
  cd client
  npm test
  ```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a comprehensive overview of the AI Movie Chatbot application, including installation instructions, configuration details, and usage guidelines. For further information, refer to the documentation in the `doc` directory.
