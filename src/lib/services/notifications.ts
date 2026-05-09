import { db } from '@/lib/firebase/client';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function saveFcmToken(token: string, userId?: string) {
  await setDoc(
    doc(db, 'fcmTokens', token),
    {
      token,
      userId: userId ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteFcmToken(token: string) {
  await deleteDoc(doc(db, 'fcmTokens', token));
}
