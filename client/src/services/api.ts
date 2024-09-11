import axios from 'axios';

const API_BASE_URL = 'http://localhost:4444/api'; // Updated to match server port

export const sendChatMessage = async (message: string) => {
  const response = await axios.post(`${API_BASE_URL}/chat`, { message });
  return response.data.response;
};

export const searchMovie = async (title: string) => {
  const response = await axios.get(`${API_BASE_URL}/movie`, { params: { title } });
  return response.data;
};