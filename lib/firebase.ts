import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config
// You can get this from Firebase Console > Project Settings > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyC7RGqlToFYYVugp5kPP1gd0Za-Q6zGnBs",
  authDomain: "tourism-1d046.firebaseapp.com",
  projectId: "tourism-1d046",
  storageBucket: "tourism-1d046.firebasestorage.app",
  messagingSenderId: "934736403877",
  appId: "1:934736403877:web:c326034b57280fba519c4c"
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback: db will be null if initialization fails
}

export { db };
export default app;

