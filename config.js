import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyAzvVgvpFL540CyMGFJ8fr_7hta4d9BLkQ",
    authDomain: "rpi-firestore-c73f2.firebaseapp.com",
    projectId: "rpi-firestore-c73f2",
    storageBucket: "rpi-firestore-c73f2.appspot.com",
    messagingSenderId: "1006044062665",
    appId: "1:1006044062665:web:1ff53dc012b2e72bfd3e18"
  };
  
  
  // Initialize Firebase
  
const server = initializeApp(firebaseConfig);
const db = getFirestore();
const User = collection(db, "system");

export {db, User, server}
