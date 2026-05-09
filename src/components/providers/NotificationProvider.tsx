'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';
import { requestFcmToken, onForegroundMessage } from '@/lib/firebase/messaging';
import { saveFcmToken } from '@/lib/services/notifications';

type NotificationContextType = {
  requestPermissionAndRegister: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'granted') return;

    initialized.current = true;

    requestFcmToken().then((token) => {
      if (token && user) saveFcmToken(token, user.uid);
    });

    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? '새 공지사항';
      const body = payload.notification?.body ?? '';
      new Notification(title, { body, icon: '/rebon_logo_blue.png' });
    });

    return unsubscribe;
  }, [user]);

  async function requestPermissionAndRegister(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    initialized.current = true;
    const token = await requestFcmToken();
    if (token && user) await saveFcmToken(token, user.uid);

    onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? '새 공지사항';
      const body = payload.notification?.body ?? '';
      new Notification(title, { body, icon: '/rebon_logo_blue.png' });
    });

    return true;
  }

  return (
    <NotificationContext.Provider value={{ requestPermissionAndRegister }}>
      {children}
    </NotificationContext.Provider>
  );
}
