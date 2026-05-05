import { db } from "../firebase/client";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { Group, Participant } from "@/types/database";

export function subscribeGroup(groupNumber: number, callback: (group: Group | null) => void) {
  const docRef = doc(db, "groups", groupNumber.toString());
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as Group);
    } else {
      callback({ id: groupNumber.toString(), groupNumber, memberIds: [] } as Group);
    }
  });
}

export function subscribeGroupMembers(groupNumber: number, callback: (members: Participant[]) => void) {
  const q = query(collection(db, "participants"), where("group", "==", groupNumber));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Participant[]);
  });
}

export async function updateGroupInfo(
  groupNumber: number,
  data: { nickname?: string; slogan?: string }
): Promise<void> {
  const docRef = doc(db, "groups", groupNumber.toString());
  await setDoc(docRef, { groupNumber, ...data }, { merge: true });
}
