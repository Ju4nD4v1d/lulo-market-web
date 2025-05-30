import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA47HnoQecetepPUSUUyhlqW0kcdUhzJqk",
  authDomain: "lulocart-9351d.firebaseapp.com",
  projectId: "lulocart-9351d",
  storageBucket: "lulocart-9351d.firebasestorage.app",
  messagingSenderId: "549863703855",
  appId: "1:549863703855:web:863e16bbe3c82ab94a4dda",
  measurementId: "G-KKDSZ08NDV"
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please check your environment variables.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);