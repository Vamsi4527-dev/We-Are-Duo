import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBkI4YP4Q3aJEqk1S2plbYVgUuavq_tee4",
  authDomain: "duet-4f538.firebaseapp.com",
  projectId: "duet-4f538",
  storageBucket: "duet-4f538.firebasestorage.app",
  messagingSenderId: "992188087759",
  appId: "1:992188087759:web:808cdc16ee68c89b5966ba",
  measurementId: "G-2C798QDVM1",
  databaseURL: "https://duet-4f538-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;