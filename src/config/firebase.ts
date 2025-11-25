import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lulop-eds249.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lulop-eds249",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lulop-eds249.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "137283240286",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:137283240286:web:79986988846a946637cfcf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RY9ZQYTHQW"
};

// Log warning if using fallback values (for development)
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn('⚠️ Firebase API key not configured. Set VITE_FIREBASE_API_KEY environment variable.');
}

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is invalid. Please check your environment variables or fallback values.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('⚠️ Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('⚠️ Firestore persistence not available in this browser');
  }
});