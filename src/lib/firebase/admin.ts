import * as admin from "firebase-admin";

function getApp(): admin.app.App {
  if (admin.apps.length) return admin.app();

  // Prefer base64-encoded full service account JSON (avoids OpenSSL 3.x key parsing issues on Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8")
    );
    return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  // Fallback: individual env vars for local dev
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
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

// preferRest: gRPC 대신 REST 사용 — Vercel(Node 18+/OpenSSL 3.x) gRPC 인증 오류 회피
// settings()는 최초 1회만 허용 → db 인스턴스를 캐싱해 중복 호출 방지
// 모듈 재평가로 캐시가 초기화되어도 try-catch로 방어
let _cachedDb: admin.firestore.Firestore | null = null;
function getAdminDb(): admin.firestore.Firestore {
  if (_cachedDb) return _cachedDb;
  const db = getApp().firestore();
  try { db.settings({ preferRest: true }); } catch { /* warm re-eval: already set */ }
  _cachedDb = db;
  return db;
}
export const adminDb = lazyProxy(getAdminDb);
export const adminAuth = lazyProxy(() => getApp().auth());
export const adminMessaging = lazyProxy(() => getApp().messaging());
