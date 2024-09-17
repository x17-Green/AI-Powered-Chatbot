import express from 'express';
import cors from 'cors';
import connectDB from './database';
import apiRoutes from './routes/api';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { resolve } from 'path';

dotenv.config();
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

connectDB();

// Update CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use('/api', apiRoutes);

// Initialize Firebase Admin with the correct file name
const serviceAccountPath = resolve(__dirname, '../../loginServiceAccountKey.json');
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});