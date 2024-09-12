import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY); // Add this line

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export const geminiApi = {
  generateChatResponse: async (message: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(message);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      logger.error('Gemini API error:', error);
      // Log more details about the error
      if (error.response) {
        logger.error('Error response:', error.response);
      }
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }
};