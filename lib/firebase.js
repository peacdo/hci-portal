// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulator if in development
if (process.env.NODE_ENV === 'development') {
    if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
        connectFirestoreEmulator(db, 
            process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST,
            process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ? 
                parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT) : 8080
        );
    }
}