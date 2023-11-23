// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
import { getFirestore }  from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhUCo3nIjWvATReGQlypR7ve7Xk8R21kw",
  authDomain: "silvoam-hospital-dbec2.firebaseapp.com",
  projectId: "silvoam-hospital-dbec2",
  storageBucket: "silvoam-hospital-dbec2.appspot.com",
  messagingSenderId: "384342484178",
  appId: "1:384342484178:web:dc5270218d00799900790b",
  measurementId: "G-7TF5C2FLDE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const fireStore = getFirestore(app);

export {auth, fireStore}