import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from '../config';

console.log('Firebase Config:', config.firebase);

export const app = initializeApp(config.firebase);
export const auth = getAuth(app);