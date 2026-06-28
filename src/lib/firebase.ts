import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "ai-for-social-good-490706",
  appId: "1:938172586538:web:8030ae10175a614d480153",
  apiKey: "AIzaSyD_qGCFVunI89cjSmelQi9nx7uMxHq39d0",
  authDomain: "ai-for-social-good-490706.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-resolved-afc3188e-59f6-4060-a040-a8460badeb16",
  storageBucket: "ai-for-social-good-490706.firebasestorage.app",
  messagingSenderId: "938172586538",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-resolved-afc3188e-59f6-4060-a040-a8460badeb16");
export default app;
