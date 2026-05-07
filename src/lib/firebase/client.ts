import { initializeApp, getApps, getApp } from "firebase/app";
<<<<<<< HEAD
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
=======
import { getFirestore, initializeFirestore, setLogLevel } from "firebase/firestore";
>>>>>>> d3626a55900d3fabd6ba8126b19f04d68bb0aaef
import { firebaseConfig } from "./config";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
<<<<<<< HEAD
const auth = getAuth(app);
const db = getFirestore(app);
=======

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
>>>>>>> d3626a55900d3fabd6ba8126b19f04d68bb0aaef

export { app, db };
