import * as admin from "firebase-admin";

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // Strip surrounding quotes Vercel sometimes adds
  let key = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  // Normalize escaped newlines (literal \n → actual newline) and CRLF
  key = key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return key;
}

function getApp(): admin.app.App {
  if (admin.apps.length) return admin.app();
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

// Lazy proxies — Firebase Admin is not initialized until the first method call.
// This prevents build-time failures when env vars are not available.
function lazyProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      const instance = factory();
      const val = Reflect.get(instance, prop);
      return typeof val === "function" ? (val as Function).bind(instance) : val;
    },
  });
}

export const adminDb = lazyProxy(() => getApp().firestore());
export const adminAuth = lazyProxy(() => getApp().auth());
export const adminMessaging = lazyProxy(() => getApp().messaging());
