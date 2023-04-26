import { initializeApp } from 'firebase/app';
import { collection, getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
    apiKey: "AIzaSyAYKjV4qU4NSVKs2D2GmiIf61GsAgZokBM",
    authDomain: "proj-dev-cbe36.firebaseapp.com",  
    projectId: "proj-dev-cbe36",  
    storageBucket: "proj-dev-cbe36.appspot.com",
    messagingSenderId: "534732493500",  
    appId: "1:534732493500:web:ab7b639f42c8c16c42b6b9"
};
  
  
  // Initialize Firebase
  
const server = initializeApp(firebaseConfig);
const db = getFirestore();
const User = collection(db, "system");

export {db, User, server}
