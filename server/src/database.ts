import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../loginServiceAccountKey.json';

dotenv.config();

const connectMongoDB = async () => {
  try{
    await  mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.log('MongoDB connection failed', error);
    return false;
  }
};

const connectFirebase = () => {
  try {
    const app = initializeApp({
      credential: cert(serviceAccount as any),
    });
    const db = getFirestore(app);
    console.log('Firebase connected successfully.');
    return db;
  } catch (error) {
    console.log('Firebase connection failed', error);
    return null;
  }
};

const connectDatabases = async () => {
  const mongoConnected = await connectMongoDB();
  if(!mongoConnected) {
    console.log('Attempting to connect to Firebase as fallback...');
  }
  const firebaseDB = connectFirebase();
  if (!mongoConnected && !firebaseDB) {
    console.log('Both MongoDB and Firebase connections failed');
    process.exit(1);
  }
  return { mongoConnected, firebaseDB };
};

export default connectDatabases;






// let connection: mongoose.Connection | null = null;

// interface ConnectResult {
//   status: string;
//   connection: mongoose.Connection;
// }

// const connectDB = async (): Promise<ConnectResult> => {
//   if (connection) return { status: 'connected', connection };

//   try {
//     console.log('Attempting to connect to MongoDB...');
//     await mongoose.connect(process.env.MONGODB_URI as string);
//     connection = mongoose.connection;
//     console.log('MongoDB connected successfully');
//     return { status: 'connected', connection };
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     throw error;
//   }
// };

// export const closeDatabase = async () => {
//   console.log('Closing database connection...');
//   if (mongoose.connection.readyState !== 0) {
//     await mongoose.disconnect();
//     console.log('Database connection closed.');
//   } else {
//     console.log('No database connection to close.');
//   }
//   connection = null;
// };

// export default connectDB;