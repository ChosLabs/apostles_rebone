import { db } from "../firebase/client";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { Bus, BusSchedule } from "@/types/database";

const BUS_COL = "buses";
const SCHEDULE_COL = "busSchedules";

// ── Buses ────────────────────────────────────────────────────

export function subscribeBuses(callback: (buses: Bus[]) => void) {
  const q = query(collection(db, BUS_COL), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Bus[]);
  });
}

export async function addBus(data: Omit<Bus, "id">): Promise<string> {
  const ref = await addDoc(collection(db, BUS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBus(id: string, data: Partial<Omit<Bus, "id">>): Promise<void> {
  await updateDoc(doc(db, BUS_COL, id), data);
}

export async function deleteBus(id: string): Promise<void> {
  await deleteDoc(doc(db, BUS_COL, id));
}

// ── Bus Schedules ─────────────────────────────────────────────

export function subscribeBusSchedules(callback: (schedules: BusSchedule[]) => void) {
  const q = query(collection(db, SCHEDULE_COL), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as BusSchedule[]);
  });
}

export async function addBusSchedule(name: string): Promise<string> {
  const ref = await addDoc(collection(db, SCHEDULE_COL), {
    name,
    busIds: [],
    assignments: {},
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBusSchedule(
  id: string,
  data: Partial<Omit<BusSchedule, "id">>
): Promise<void> {
  await updateDoc(doc(db, SCHEDULE_COL, id), data);
}

export async function deleteBusSchedule(id: string): Promise<void> {
  await deleteDoc(doc(db, SCHEDULE_COL, id));
}
