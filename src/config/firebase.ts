import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAqJypQXdnA6__A5xDGie-e9rK_UbsCVEE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lulop-eds249.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lulop-eds249",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lulop-eds249.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "137283240286",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:137283240286:web:79986988846a946637cfcf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RY9ZQYTHQW"
};

// Log warning if using fallback values (for development)
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn('⚠️ Using fallback Firebase configuration. Set VITE_FIREBASE_* environment variables for production.');
}

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is invalid. Please check your environment variables or fallback values.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);