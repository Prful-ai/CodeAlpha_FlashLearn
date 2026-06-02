import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfigJson from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || ""
};

const app = initializeApp(firebaseConfig);

let firestoreInstance: Firestore;

const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || "(default)";

// Frame isolation detection. In sandboxed preview iFrames, the browser blocks multi-tab IndexedDB storage.
// We fall back automatically to standard Firestore to bypass transaction errors.
let useLocalCacheFallback = false;
if (typeof window !== "undefined") {
  try {
    const isFrame = window.self !== window.top;
    if (isFrame) {
      useLocalCacheFallback = true;
    }
  } catch (e) {
    useLocalCacheFallback = true;
  }
}

if (useLocalCacheFallback) {
  console.info("Iframe sandbox environment detected: Using standard Firestore configuration to bypass IndexedDB constraints.");
  firestoreInstance = getFirestore(app, firestoreDatabaseId);
} else {
  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firestoreDatabaseId);
  } catch (error) {
    console.warn("Failed to initialize Firestore with persistent multi-tab cache, falling back to standard Firestore instance:", error);
    firestoreInstance = getFirestore(app, firestoreDatabaseId);
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);
