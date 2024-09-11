import axios from 'axios';
import { createMovieDbApi } from '../services/moviedb';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MovieDB Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should search for a movie', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      data: {
        results: [{ title: 'Inception' }]
      }
    });
    const movieDbApi = createMovieDbApi({ get: mockGet } as any);

    const results = await movieDbApi.searchMovie('Inception');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
  });

  it('should handle API errors', async () => {
    const mockGet = jest.fn().mockRejectedValue({
      response: { status: 401 }
    });
    const movieDbApi = createMovieDbApi({ get: mockGet } as any);

    await expect(movieDbApi.searchMovie('Test')).rejects.toThrow('Invalid API key');
  });
});