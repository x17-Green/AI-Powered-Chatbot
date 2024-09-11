import mongoose from 'mongoose';
import connectDB, { closeDatabase } from '../database';

describe('MongoDB Connection', () => {
  afterEach(async () => {
    await closeDatabase();
    jest.clearAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce(undefined as any);
    const result = await connectDB();
    expect(connectSpy).toHaveBeenCalledWith(process.env.MONGODB_URI);
    expect(result.status).toBe('connected');
    expect(result.connection).toBeDefined();
  });

  it('should handle connection errors', async () => {
    const error = new Error('Connection failed');
    jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(error);
    await expect(connectDB()).rejects.toThrow('Connection failed');
  });
});