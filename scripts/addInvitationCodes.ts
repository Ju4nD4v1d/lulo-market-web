// TESTING SCRIPT - Run this once to populate invitation codes
// This file is for testing purposes only and not part of the main application

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAqJypQXdnA6__A5xDGie-e9rK_UbsCVEE",
  authDomain: "lulop-eds249.firebaseapp.com",
  projectId: "lulop-eds249",
  storageBucket: "lulop-eds249.appspot.com",
  messagingSenderId: "137283240286",
  appId: "1:137283240286:web:79986988846a946637cfcf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const initialCodes = [
  'LULOCART2024',
  'LATINMARKET',
  'EXCLUSIVE01',
  'BETA2024',
  'EARLYACCESS',
  'PREMIUM001',
  'INVITE2024',
  'LULO001',
  'MARKET001',
  'WELCOME001'
];

async function addInvitationCodes() {
  console.log('🚀 Adding initial invitation codes to Firebase...');
  
  try {
    const codesRef = collection(db, 'invitation_codes');
    
    for (const code of initialCodes) {
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