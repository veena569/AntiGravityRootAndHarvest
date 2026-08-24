import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDas_n4rJv7ZArHbD0wp9RfOpHF2dZN6AY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "root-and-harvest-f5b08.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "root-and-harvest-f5b08",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "root-and-harvest-f5b08.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "630976172922",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:630976172922:web:f3aa09b26ef12a9becbcc3",
};

let app: any;
let auth: any;
let storage: any;

// Safely initialize Firebase only if configuration parameters are provided.
// This prevents Next.js compilation from throwing "auth/invalid-api-key" during static pre-rendering builds.
if (firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  // Empty mock export for server-side build compatibility
  auth = {} as any;
  storage = {} as any;
}

export { app, auth, storage };
