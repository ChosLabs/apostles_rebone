import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { CallingZoneConfig, CallingStamp } from "@/types/database";

const CONFIG_DOC = doc(db, "callingZoneConfig", "settings");
const STAMPS_COL = collection(db, "callingStamps");

// 기본 부스 코드 초기값
const DEFAULT_CONFIG: CallingZoneConfig = {
  booths: {
    comfort:    { code: "1111" },
    prayer:     { code: "2222" },
    experience: { code: "3333" },
    activity:   { code: "4444" },
  },
};

export function subscribeCallingZoneConfig(
  callback: (config: CallingZoneConfig) => void
) {
  return onSnapshot(CONFIG_DOC, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as CallingZoneConfig);
    } else {
      // 문서 없으면 기본값으로 초기화
      setDoc(CONFIG_DOC, DEFAULT_CONFIG);
      callback(DEFAULT_CONFIG);
    }
  });
}

export async function updateBoothCode(boothId: string, code: string): Promise<void> {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) {
    await setDoc(CONFIG_DOC, DEFAULT_CONFIG);
  }
  await updateDoc(CONFIG_DOC, { [`booths.${boothId}.code`]: code });
}

export function subscribeUserStamps(
  userId: string,
  callback: (stamps: string[]) => void
) {
  return onSnapshot(doc(db, "callingStamps", userId), (snap) => {
    if (snap.exists()) {
      callback((snap.data() as CallingStamp).stamps ?? []);
    } else {
      callback([]);
    }
  });
}

export async function addStamp(
  userId: string,
  userName: string,
  userTeam: string,
  boothId: string,
  allBoothIds: string[]
): Promise<void> {
  const stampRef = doc(db, "callingStamps", userId);
  const snap = await getDoc(stampRef);

  if (!snap.exists()) {
    const newStamps = [boothId];
    await setDoc(stampRef, {
      userId,
      userName,
      userTeam,
      stamps: newStamps,
      completedAt: newStamps.length === allBoothIds.length ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  } else {
    const current = (snap.data() as CallingStamp).stamps ?? [];
    if (current.includes(boothId)) return;
    const updated = [...current, boothId];
    await updateDoc(stampRef, {
      stamps: updated,
      completedAt:
        updated.length === allBoothIds.length ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeAllCallingStamps(
  callback: (stamps: CallingStamp[]) => void
) {
  return onSnapshot(STAMPS_COL, (snap) => {
    callback(snap.docs.map((d) => ({ ...d.data() } as CallingStamp)));
  });
}
