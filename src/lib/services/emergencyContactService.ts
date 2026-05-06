import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { EmergencyContact } from "@/types/database";

const COL = "emergencyContacts";

export function subscribeEmergencyContacts(
  callback: (contacts: EmergencyContact[]) => void
) {
  const q = query(collection(db, COL), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmergencyContact)));
  });
}

export async function addEmergencyContact(
  data: Omit<EmergencyContact, "id">
): Promise<void> {
  await addDoc(collection(db, COL), data);
}

export async function updateEmergencyContact(
  id: string,
  data: Partial<Omit<EmergencyContact, "id">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
