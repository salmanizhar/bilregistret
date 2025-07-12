// Bilregistret Firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBa2695JTdAVO5pOnitSYmkbAMw4LV4nME",
    authDomain: "bilregistret-60bc6.firebaseapp.com",
    databaseURL: "https://bilregistret-60bc6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bilregistret-60bc6",
    storageBucket: "bilregistret-60bc6.firebasestorage.app",
    messagingSenderId: "197320497670",
    appId: "1:197320497670:web:f901426b6835754ae94187"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;