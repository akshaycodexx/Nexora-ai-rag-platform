import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCd73zyMW_-YTpaM9l-PwVirExZ06ej8Pk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexora-ai-a7cbd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexora-ai-a7cbd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexora-ai-a7cbd.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "512541938926",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:512541938926:web:33573640994459ced68fff",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8Z1544ZEBY"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth & Firestore DB Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Initialize Analytics conditionally (browser environment)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;
