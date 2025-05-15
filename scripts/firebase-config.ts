// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnBHowVaPLsRod-bkmcM-yJAeoiyBtzXc",
  authDomain: "coopgo-ca53a.firebaseapp.com",
  databaseURL: "https://coopgo-ca53a-default-rtdb.firebaseio.com",
  projectId: "coopgo-ca53a",
  storageBucket: "coopgo-ca53a.firebasestorage.app",
  messagingSenderId: "505346926217",
  appId: "1:505346926217:web:f2f6e851a71781c8a8c858",
  measurementId: "G-589VCD5XLP",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
