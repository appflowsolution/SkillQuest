import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore 
} from 'firebase/firestore';

const getEnv = (key: string, fallback: string = ''): string => {
  const meta = import.meta as any;
  if (meta?.env?.[key]) {
    return meta.env[key];
  }
  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  if (proc?.env?.[key]) {
    return proc.env[key] || '';
  }
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'other-project-b1f2e.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'other-project-b1f2e'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'other-project-b1f2e.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '838300773191'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:838300773191:web:2ee87b79ac4959e01eba62'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-VKWXPFPSY9')
};

// Singleton initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    }),
    ignoreUndefinedProperties: true
  });
} catch {
  // If already initialized (e.g. during hot reload), fallback to getFirestore
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
