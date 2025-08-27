// TESTING SCRIPT - Run this once to populate invitation codes
// This file is for testing purposes only and not part of the main application

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// This script requires the Firebase API key to be set as an environment variable
// Run with: FIREBASE_API_KEY=your-key node scripts/addInvitationCodes.ts
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: "lulop-eds249.firebaseapp.com",
  projectId: "lulop-eds249",
  storageBucket: "lulop-eds249.appspot.com",
  messagingSenderId: "137283240286",
  appId: "1:137283240286:web:79986988846a946637cfcf"
};

if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase API key is required. Set FIREBASE_API_KEY environment variable.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newCodes = [
  'ACCESS2025',
  'GOLDEN001',
  'PRIORITY01',
  'SPECIAL001',
  'PLATINUM01',
  'MEMBER001',
  'VIP2025',
  'ELITE001',
  'LAUNCH001',
  'PRIME001'
];

async function addInvitationCodes() {
  console.log('🚀 Adding new invitation codes to Firebase...');
  
  try {
    const codesRef = collection(db, 'invitation_codes');
    
    for (const code of newCodes) {
      await addDoc(codesRef, {
        code: code,
        isUsed: false,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Added code: ${code}`);
    }
    
    console.log('🎉 All invitation codes added successfully!');
  } catch (error) {
    console.error('❌ Error adding invitation codes:', error);
  }
}

// Uncomment the line below and run this script to add codes
// addInvitationCodes();