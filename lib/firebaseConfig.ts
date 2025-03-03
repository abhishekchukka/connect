// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyBQcCWFA1BqBjijeKBv_SUf-82skVjWW4E",
  authDomain: "connect-smart-9ad2e.firebaseapp.com",
  projectId: "connect-smart-9ad2e",
  storageBucket: "connect-smart-9ad2e.firebasestorage.app",
  messagingSenderId: "516481709614",
  appId: "1:516481709614:web:c201b211fbe5dabee6d1bf",
  measurementId: "G-ZVPTV9VE6E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// export const storage = getStorage(app);
