import { db } from "../firebase/client";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { DispatchedChurch } from "@/types/database";

const COL = "dispatchedChurches";

export function subscribeDispatchedChurches(callback: (churches: DispatchedChurch[]) => void) {
  const q = query(collection(db, COL), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as DispatchedChurch[]);
  });
}

export async function addDispatchedChurch(
  data: Omit<DispatchedChurch, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDispatchedChurch(
  id: string,
  data: Partial<Omit<DispatchedChurch, "id">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteDispatchedChurch(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
