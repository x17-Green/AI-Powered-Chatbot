import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4444;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;