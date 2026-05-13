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
import { getNotifResetAt } from '@/lib/services/appConfigService';

const NOTIF_AT_KEY = 'rebone_notif_at';

function getLocalNotifAt(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(NOTIF_AT_KEY) ?? '0', 10);
}

function setLocalNotifAt() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIF_AT_KEY, Date.now().toString());
  }
}

function clearLocalNotifAt() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(NOTIF_AT_KEY);
  }
}

// 서비스 워커 showNotification 사용 (new Notification()보다 안정적)
async function showNotification(title: string, body: string) {
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: '/rebon_logo_blue.png',
        badge: '/rebon_logo_blue.png',
      });
      return;
    }
  } catch {
    // fallback
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/rebon_logo_blue.png' });
  }
}

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
  const tokenRegistered = useRef(false);

  // 포어그라운드 메시지 핸들러 — 마운트 1회만 등록
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? '📢 공지';
      const body = payload.notification?.body ?? '';
      showNotification(title, body);
    });

    return unsubscribe;
  }, []);

  // FCM 토큰 자동 등록
  useEffect(() => {
    if (tokenRegistered.current) return;
    if (!user) return;
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'granted') return;

    const localAt = getLocalNotifAt();

    getNotifResetAt().then((resetAt) => {
      // localAt > 0 인데 리셋 이후에 등록된 것 → 재동의 필요
      if (localAt > 0 && localAt <= resetAt) {
        clearLocalNotifAt();
        return;
      }

      // localAt === 0: 이전 코드에서 허용한 유저 (rebone_notif_at 키 없음) → 자동 등록
      // localAt > resetAt: 정상 케이스 → 자동 재등록
      tokenRegistered.current = true;
      if (localAt === 0) setLocalNotifAt(); // 처음 등록 시각 기록

      requestFcmToken().then((token) => {
        if (token) saveFcmToken(token, user.uid);
      });
    });
  }, [user]);

  async function requestPermissionAndRegister(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const token = await requestFcmToken();
    if (token && user) {
      await saveFcmToken(token, user.uid);
      setLocalNotifAt();
    }
    tokenRegistered.current = true;
    return true;
  }

  return (
    <NotificationContext.Provider value={{ requestPermissionAndRegister }}>
      {children}
    </NotificationContext.Provider>
  );
}
