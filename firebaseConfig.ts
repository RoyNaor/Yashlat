import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANDjISA5TxxWutV6cO0j1fBPwlKiOUtvg",
  authDomain: "miluim-8716.firebaseapp.com",
  projectId: "miluim-8716",
  storageBucket: "miluim-8716.firebasestorage.app",
  messagingSenderId: "79539215075",
  appId: "1:79539215075:web:6fbc3952cd6bfad7bc43d6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
