import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

const STORAGE_KEY_FIREBASE_CONFIG = 'sodam_sports_firebase_config';

export const getStoredFirebaseConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse Firebase config', e);
  }
  return null;
};

export const saveFirebaseConfig = (config) => {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
  } else {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
  }
};

let dbInstance = null;
let currentApp = null;

export const initFirebase = (config = null) => {
  const fbConfig = config || getStoredFirebaseConfig();
  if (!fbConfig || !fbConfig.apiKey || !fbConfig.projectId) {
    return null;
  }
  try {
    if (getApps().length === 0) {
      currentApp = initializeApp(fbConfig);
    } else {
      currentApp = getApp();
    }
    dbInstance = getFirestore(currentApp);
    return dbInstance;
  } catch (error) {
    console.error('Firebase init error:', error);
    return null;
  }
};

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = initFirebase();
  }
  return dbInstance;
};
