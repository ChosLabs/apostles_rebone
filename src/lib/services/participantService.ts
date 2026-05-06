import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  deleteField
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Participant, TeamType, AttendanceType } from "@/types/database";

const COLLECTION_NAME = "participants";

export async function getParticipants(): Promise<Participant[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Participant[];
}

export async function addParticipant(data: Omit<Participant, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateParticipant(id: string, data: Partial<Omit<Participant, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const sanitized: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = value === undefined ? deleteField() : value;
  }
  await updateDoc(docRef, sanitized);
}

export async function deleteParticipant(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function getParticipantsByGroup(groupNumber: number): Promise<Participant[]> {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("group", "==", groupNumber),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Participant[];
}

export async function getUnassignedParticipants(): Promise<Participant[]> {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("group", "==", null),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  // Firestore doesn't support where("group", "==", null) if the field is missing
  // So we might need to fetch all and filter, or ensure the field exists
  // For now, let's fetch all and filter in memory if needed, but let's try the query first.
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Participant[];
}

export async function getParticipantsWithoutRoom(): Promise<Participant[]> {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("room", "==", null),
    orderBy("name", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Participant[];
}
