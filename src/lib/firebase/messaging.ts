import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { app } from './client';

let swRegistration: ServiceWorkerRegistration | null = null;

async function getSWRegistration(): Promise<ServiceWorkerRegistration> {
  if (swRegistration) return swRegistration;
  swRegistration = await navigator.serviceWorker.register(
    '/api/firebase-messaging-sw',
    { scope: '/' }
  );
  return swRegistration;
}

export async function requestFcmToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(app);
    const registration = await getSWRegistration();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
