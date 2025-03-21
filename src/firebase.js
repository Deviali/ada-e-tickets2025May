import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAbRzUzEMT48IuJ7Mkl-wt4WzyFGRE7kJA",
    authDomain: "adavision2025may.firebaseapp.com",
    projectId: "adavision2025may",
    storageBucket: "adavision2025may.firebasestorage.app",
    messagingSenderId: "539191394630",
    appId: "1:539191394630:web:80d93070b793cd53496547",
    measurementId: "G-XL7LVX0M42"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);