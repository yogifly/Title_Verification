// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDYLv7FnI3UeVlm54ZfffCFkgbbDA55kLQ",
    authDomain: "title-verification.firebaseapp.com",
    projectId: "title-verification",
    storageBucket: "title-verification.firebasestorage.app",
    messagingSenderId: "964484114105",
    appId: "1:964484114105:web:91a856f065e292492c9d68",
    measurementId: "G-3FFL010X4X"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
