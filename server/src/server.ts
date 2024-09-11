import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database';
import apiRoutes from './routes/api';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('AI Movie Chatbot API is running');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}