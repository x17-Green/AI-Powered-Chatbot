import express from 'express';
import cors from 'cors';
import connectDB from './database';
import apiRoutes from './routes/api';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your client URL
  credentials: true, // Allow credentials
}));

app.use(express.json());
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});