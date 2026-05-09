import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { app } from './client';

async function getSWRegistration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register(
    '/api/firebase-messaging-sw',
    { scope: '/' }
  );
  // navigator.serviceWorker.ready resolves only after a SW is active
  return navigator.serviceWorker.ready;
}

export async function requestFcmToken(): Promise<string | null> {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error('[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set');
    return null;
  }
  try {
    const messaging = getMessaging(app);
    const registration = await getSWRegistration();
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) console.warn('[FCM] getToken returned empty — check VAPID key and notification permission');
    return token || null;
  } catch (err) {
    console.error('[FCM] requestFcmToken failed:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
