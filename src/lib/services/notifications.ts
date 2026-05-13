import { db } from '@/lib/firebase/client';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const DEVICE_TOKEN_KEY = 'rebone_fcm_device_token';

export async function saveFcmToken(token: string, userId?: string) {
  // 같은 기기의 이전 토큰이 다르면 삭제 (토큰 중복으로 인한 알림 2회 방지)
  if (typeof window !== 'undefined') {
    const prev = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (prev && prev !== token) {
      try { await deleteDoc(doc(db, 'fcmTokens', prev)); } catch {}
    }
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  }

  await setDoc(
    doc(db, 'fcmTokens', token),
    { token, userId: userId ?? null, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function deleteFcmToken(token: string) {
  await deleteDoc(doc(db, 'fcmTokens', token));
}
