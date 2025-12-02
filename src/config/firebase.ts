import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Development fallbacks (only used when VITE_ENV is not 'production')
const DEV_FALLBACKS = {
  authDomain: 'lulop-eds249.firebaseapp.com',
  projectId: 'lulop-eds249',
  storageBucket: 'lulop-eds249.appspot.com',
  messagingSenderId: '137283240286',
  appId: '1:137283240286:web:79986988846a946637cfcf',
  measurementId: 'G-RY9ZQYTHQW',
};

const isProduction = import.meta.env.VITE_ENV === 'production';

// In production, all values MUST come from environment variables
// In development, fallbacks are allowed for convenience
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (isProduction ? undefined : DEV_FALLBACKS.authDomain),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || (isProduction ? undefined : DEV_FALLBACKS.projectId),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (isProduction ? undefined : DEV_FALLBACKS.storageBucket),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (isProduction ? undefined : DEV_FALLBACKS.messagingSenderId),
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (isProduction ? undefined : DEV_FALLBACKS.appId),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (isProduction ? undefined : DEV_FALLBACKS.measurementId),
};

// Validate required configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'] as const;
const missingFields = requiredFields.filter(
  (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
);

if (missingFields.length > 0) {
  const envPrefix = isProduction ? 'Production' : 'Development';
  throw new Error(
    `${envPrefix} Firebase configuration is missing: ${missingFields
      .map((f) => `VITE_FIREBASE_${f.toUpperCase().replace(/([A-Z])/g, '_$1')}`)
      .join(', ')}. Please check your environment variables.`
  );
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