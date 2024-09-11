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
    await mongoose.connect(process.env.MONGODB_URI as string);
    connection = mongoose.connection;
    return { status: 'connected', connection };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connection = null;
};

export default connectDB;