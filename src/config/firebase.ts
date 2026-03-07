import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyDv17OU9Utg5xVdmAewo4zWRYn8HMN3hf0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "reparingrecords.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "https://reparingrecords-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "reparingrecords",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "reparingrecords.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "583476489375",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:583476489375:web:de7aaf5a043e9fb76d46aa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-H9YP7VJPEW",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
