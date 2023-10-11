import { initializeApp } from 'firebase/app';
import { collection, getFirestore, getDocs, query, where } from 'firebase/firestore/lite';

const firebaseConfig = {

  apiKey: "AIzaSyAppIcssjxVQDF9va6L-wVPPTDff2i8Rqk",

  authDomain: "dev-project-f500d.firebaseapp.com",

  projectId: "dev-project-f500d",

  storageBucket: "dev-project-f500d.appspot.com",

  messagingSenderId: "640524870334",

  appId: "1:640524870334:web:0a1a07fb8a1474bec834ef"

};  
  
// Initialize Firebase
  
const server = initializeApp(firebaseConfig);
const db = getFirestore();
const User = collection(db, "system");


export {db, User, server};
