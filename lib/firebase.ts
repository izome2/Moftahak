// Firebase Configuration for Phone Authentication
// إعدادات Firebase للتحقق من رقم الهاتف

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, RecaptchaVerifier } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAGEu4lfHr5Wd70SVDsNYlN1wDTU1RJTBw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "moftahak-2c12c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moftahak-2c12c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "moftahak-2c12c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "171434635762",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:171434635762:web:7445539896203db18dbb6b",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-YMD9TNTMXV"
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
    // Set language to Arabic
    auth.languageCode = 'ar';
  }
  return auth;
}

// Create invisible reCAPTCHA verifier
export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // Response expired - ask user to solve reCAPTCHA again
      console.log('reCAPTCHA expired');
    }
  });
}

// Phone number formatting for Egypt (+20)
export function formatPhoneNumberForFirebase(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If starts with 0, remove it and add +20
  if (cleaned.startsWith('0')) {
    return `+20${cleaned.substring(1)}`;
  }
  
  // If already starts with 20, add +
  if (cleaned.startsWith('20')) {
    return `+${cleaned}`;
  }
  
  // If starts with +20, return as is
  if (phoneNumber.startsWith('+20')) {
    return phoneNumber;
  }
  
  // Default: add +20
  return `+20${cleaned}`;
}

// Validate Egyptian phone number
export function isValidEgyptianPhone(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Egyptian mobile numbers: 01[0125][0-9]{8}
  // Total: 11 digits starting with 0
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    const validPrefixes = ['010', '011', '012', '015'];
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }
  
  // Also accept without leading 0 (10 digits)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    const validPrefixes = ['10', '11', '12', '15'];
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }
  
  return false;
}

export { RecaptchaVerifier } from 'firebase/auth';
