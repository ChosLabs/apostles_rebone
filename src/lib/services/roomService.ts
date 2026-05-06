import { db } from "../firebase/client";
import {
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { Room } from "@/types/database";

export async function getRooms(): Promise<Room[]> {
  const q = query(collection(db, "rooms"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Room[];
}

export async function addRoom(name: string): Promise<string> {
  const docRef = await addDoc(collection(db, "rooms"), { name, memberIds: [] });
  return docRef.id;
}

export async function deleteRoom(id: string): Promise<void> {
  await deleteDoc(doc(db, "rooms", id));
}
