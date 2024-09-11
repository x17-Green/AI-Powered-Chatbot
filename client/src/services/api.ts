import axios from 'axios';

const API_URL = 'http://localhost:4444/api';

export const sendChatMessage = async (message: string): Promise<string> => {
  const response = await axios.post(`${API_URL}/chat`, { message });
  return response.data;
};

export const searchMovie = async (query: string): Promise<any> => {
  const response = await axios.get(`${API_URL}/movie`, { params: { query } });
  return response.data;
};