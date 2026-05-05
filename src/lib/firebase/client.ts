import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use initializeFirestore with long polling to prevent GRPC errors in SSR/Next.js
let db;
if (getApps().length > 0) {
  // If app is already initialized, try to get existing db or initialize it
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch (e) {
    // If initializeFirestore fails because it's already been called, fallback to getFirestore
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

// Initialize Analytics conditionally (only in browser)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
