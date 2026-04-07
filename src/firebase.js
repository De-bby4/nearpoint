import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyCvDJ2e7s1gfN5tqFzIWCmiyeQ7cDV9fO4",
  authDomain: "business-map-app-1eec2.firebaseapp.com",
  projectId: "business-map-app-1eec2",
  storageBucket: "business-map-app-1eec2.firebasestorage.app",
  messagingSenderId: "1090948419180",
  appId: "1:1090948419180:web:23dc7afd77dae0b99e9249"
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); 