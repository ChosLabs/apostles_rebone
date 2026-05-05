import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/client";
import { TimetableItem } from "@/types/database";

const COLLECTION_NAME = "timetable";

export async function getTimetable(): Promise<TimetableItem[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("day", "asc"), orderBy("time", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TimetableItem[];
}

export async function getTimetableByDay(day: number): Promise<TimetableItem[]> {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("day", "==", day),
    orderBy("time", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TimetableItem[];
}

export async function addTimetableItem(data: Omit<TimetableItem, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTimetableItem(id: string, data: Partial<Omit<TimetableItem, "id">>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTimetableItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
