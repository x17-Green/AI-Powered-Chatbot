import axios from 'axios';
import { createOpenAiApi } from '../services/openai';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate a chat response', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Mocked response' } }]
      }
    });
    const openAiApi = createOpenAiApi({ post: mockPost } as any);

    const response = await openAiApi.generateChatResponse('Hello, AI!');
    expect(response).toBe('Mocked response');
  });

  it('should handle API errors', async () => {
    const mockPost = jest.fn().mockRejectedValue({
      response: { status: 500 }
    });
    const openAiApi = createOpenAiApi({ post: mockPost } as any);

    await expect(openAiApi.generateChatResponse('Test')).rejects.toThrow('Failed to generate chat response');
  });

  it('should handle rate limit errors', async () => {
    const mockPost = jest.fn().mockRejectedValue({
      response: { status: 429 }
    });
    const openAiApi = createOpenAiApi({ post: mockPost } as any);

    await expect(openAiApi.generateChatResponse('Test')).rejects.toThrow('API rate limit exceeded');
  });
});