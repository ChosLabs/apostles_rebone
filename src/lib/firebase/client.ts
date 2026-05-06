import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Firebase SDK 12.x logs a harmless "GRPC error has no .code" on startup in
// environments where gRPC is unavailable (e.g. WSL2). forceLongPolling handles
// the actual fallback; only suppress debug/info noise, keep errors visible.
setLogLevel("error");

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// initializeFirestore must only be called once per app instance.
// On hot-reload the app persists, so we fall back to getFirestore.
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  db = getFirestore(app);
}

export { app, db };
