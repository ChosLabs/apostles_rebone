import { adminDb } from "../firebase/admin";
import { TimetableItem } from "@/types/database";

export async function getTimetableServer(): Promise<TimetableItem[]> {
  const snapshot = await adminDb
    .collection("timetable")
    .orderBy("day", "asc")
    .orderBy("time", "asc")
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TimetableItem[];
}
