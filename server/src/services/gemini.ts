import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

console.log('GOOGLE_GEMINI_API_KEY:', process.env.GOOGLE_GEMINI_API_KEY); // Add this line

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const geminiApi = {
  generateChatResponse: async (message: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(message);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      logger.error('Gemini API error:', error);
      if (error.message.includes('SAFETY')) {
        throw new Error('The AI couldn\'t process this request due to safety concerns. Please try rephrasing your message.');
      }
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }
};