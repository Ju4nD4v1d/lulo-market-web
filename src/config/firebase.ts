import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqJypQXdnA6__A5xDGie-e9rK_UbsCVEE",
  authDomain: "lulop-eds249.firebaseapp.com",
  projectId: "lulop-eds249",
  storageBucket: "lulop-eds249.appspot.com",
  messagingSenderId: "137283240286",
  appId: "1:137283240286:web:79986988846a946637cfcf",
  measurementId: "G-RY9ZQYTHQW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);