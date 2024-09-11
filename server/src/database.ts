import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let connection: mongoose.Connection | null = null;

interface ConnectResult {
  status: string;
  connection: mongoose.Connection;
}

const connectDB = async (): Promise<ConnectResult> => {
  if (connection) return { status: 'connected', connection };

  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    connection = mongoose.connection;
    console.log('MongoDB connected successfully');
    return { status: 'connected', connection };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  console.log('Closing database connection...');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  } else {
    console.log('No database connection to close.');
  }
  connection = null;
};

export default connectDB;