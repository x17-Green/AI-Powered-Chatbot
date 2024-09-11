import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export const createOpenAiApi = (axiosInstance?: AxiosInstance) => {
  const api = axiosInstance || axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    generateChatResponse: async (message: string) => {
      try {
        const response = await api.post('/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }]
        });
        return response.data.choices[0].message.content;
      } catch (error: any) {
        if (error.response && error.response.status === 429) {
          logger.error('OpenAI API rate limit exceeded');
          throw new Error('API rate limit exceeded');
        }
        logger.error('OpenAI API error:', error);
        throw new Error('Failed to generate chat response');
      }
    }
  };
};

export const openAiApi = createOpenAiApi();