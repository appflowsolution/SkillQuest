import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  Firestore 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDIVGUopRMQCZ6cZgsX5rdhjuG5jpidG5g",
  authDomain: "other-project-b1f2e.firebaseapp.com",
  projectId: "other-project-b1f2e",
  storageBucket: "other-project-b1f2e.firebasestorage.app",
  messagingSenderId: "838300773191",
  appId: "1:838300773191:web:2ee87b79ac4959e01eba62",
  measurementId: "G-VKWXPFPSY9"
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
