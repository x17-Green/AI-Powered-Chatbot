import request from 'supertest';
import { app } from '../server';
import connectDB, { closeDatabase } from '../database';

jest.setTimeout(30000); // Increase the timeout to 30 seconds

describe('Express Server', () => {
  beforeAll(async () => {
    await connectDB();
  }, 20000);

  afterAll(async () => {
    await closeDatabase();
  }, 20000);

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