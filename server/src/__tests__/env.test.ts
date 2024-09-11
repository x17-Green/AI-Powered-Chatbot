import dotenv from 'dotenv';

describe('Environment Variables', () => {
  beforeAll(() => {
    dotenv.config({ path: '.env.test' });
  });

  it('should have all necessary environment variables set', () => {
    expect(process.env.PORT).toBeDefined();
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.OPENAI_API_KEY).toBeDefined();
    expect(process.env.MOVIEDB_API_KEY).toBeDefined();
  });
});