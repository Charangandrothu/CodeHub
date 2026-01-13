// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCm7AljG9qo8z3BCjo10Fne9Cgqkcmrb04",
  authDomain: "codehuborg.firebaseapp.com",
  projectId: "codehuborg",
  storageBucket: "codehuborg.firebasestorage.app",
  messagingSenderId: "786596775052",
  appId: "1:786596775052:web:1f0ee39342ad2c6e57e7a9",
  measurementId: "G-DBCCFF12R5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;