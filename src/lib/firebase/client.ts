import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// experimentalAutoDetectLongPolling: tries WebSocket first, falls back to
// long polling automatically. Fixes gRPC connectivity in environments where
// WebSocket is blocked (some browsers/networks/Vercel edge cases).
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  db = getFirestore(app);
}

export { app, db };
