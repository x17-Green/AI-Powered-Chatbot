import request from 'supertest';
import { app } from '../server';

describe('Express Server', () => {
  it('should start without errors', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('AI Movie Chatbot API is running');
  });

  it('should have API routes', async () => {
    const chatResponse = await request(app).get('/api/chat');
    expect(chatResponse.status).toBe(200);
    expect(chatResponse.body).toEqual({ message: 'Chat endpoint' });

    const movieResponse = await request(app).get('/api/movie');
    expect(movieResponse.status).toBe(200);
    expect(movieResponse.body).toEqual({ message: 'Movie endpoint' });
  });
});