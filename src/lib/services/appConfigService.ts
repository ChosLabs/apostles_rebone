import { db } from "../firebase/client";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const CONFIG_REF = () => doc(db, "appConfig", "settings");

export async function setGuestMode(enabled: boolean) {
  await setDoc(CONFIG_REF(), { guestModeEnabled: enabled }, { merge: true });
}

// 알림 초기화 시각 조회 (ms timestamp, 없으면 0)
export async function getNotifResetAt(): Promise<number> {
  const snap = await getDoc(CONFIG_REF());
  if (!snap.exists()) return 0;
  const val = snap.data()?.notifResetAt;
  if (!val) return 0;
  if (typeof val === "number") return val;
  return val?.toMillis?.() ?? 0;
}

export function subscribeGuestMode(cb: (enabled: boolean, fromCache: boolean) => void) {
  return onSnapshot(CONFIG_REF(), { includeMetadataChanges: true }, (snap) => {
    cb(
      snap.exists() ? Boolean(snap.data()?.guestModeEnabled) : false,
      snap.metadata.fromCache,
    );
  });
}

export async function setDarkModeLocked(locked: boolean) {
  await setDoc(CONFIG_REF(), { darkModeLocked: locked }, { merge: true });
}

export function subscribeDarkModeLocked(cb: (locked: boolean) => void) {
  return onSnapshot(CONFIG_REF(), (snap) => {
    cb(snap.exists() ? Boolean(snap.data()?.darkModeLocked) : false);
  });
}
