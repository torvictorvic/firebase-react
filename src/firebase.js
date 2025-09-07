import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

// Auth must be created after initializeApp
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);

// Optional
onAuthStateChanged(auth, (u) => console.log("Anon signed in:", u?.uid));

export const db = getDatabase(app);
export { ref, onValue };
