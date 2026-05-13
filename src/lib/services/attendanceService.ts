import { db } from "@/lib/firebase/client";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { AttendanceSession, AttendanceGroup, AttendanceParticipant, BusSchedule, Bus } from "@/types/database";

const COLL = "attendanceSessions";

function toParticipant(p: { id: string; name: string; group?: number; phone?: string }): AttendanceParticipant {
  const result: AttendanceParticipant = { id: p.id, name: p.name };
  if (p.group !== undefined) result.group = p.group;
  if (p.phone !== undefined) result.phone = p.phone;
  return result;
}

export function subscribeAttendanceSessions(
  cb: (sessions: AttendanceSession[]) => void
): () => void {
  const q = query(collection(db, COLL), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceSession)));
  });
}

export function subscribeAttendanceSession(
  id: string,
  cb: (session: AttendanceSession | null) => void
): () => void {
  return onSnapshot(doc(db, COLL, id), (snap) => {
    if (!snap.exists()) { cb(null); return; }
    cb({ id: snap.id, ...snap.data() } as AttendanceSession);
  });
}

export async function addAttendanceSession(name: string, order: number): Promise<string> {
  const docRef = await addDoc(collection(db, COLL), {
    name,
    order,
    managers: [],
    groups: [],
    records: {},
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addSessionFromBusSchedule(
  name: string,
  order: number,
  schedule: BusSchedule,
  allBuses: Bus[]
): Promise<string> {
  const groups: AttendanceGroup[] = schedule.busIds.map((busId) => {
    const bus = allBuses.find((b) => b.id === busId);
    const roster = schedule.assignments[busId];
    return {
      id: busId,
      name: bus?.name ?? "버스",
      participants: (roster?.participants ?? []).map(toParticipant),
    };
  });

  const docRef = await addDoc(collection(db, COLL), {
    name,
    order,
    managers: [],
    groups,
    records: {},
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAttendanceSession(
  id: string,
  data: Partial<Omit<AttendanceSession, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COLL, id), data as any);
}

export async function deleteAttendanceSession(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL, id));
}

export async function markAttendance(
  sessionId: string,
  participantId: string,
  attended: boolean
): Promise<void> {
  await updateDoc(doc(db, COLL, sessionId), {
    [`records.${participantId}`]: {
      attended,
      attendedAt: attended ? serverTimestamp() : null,
    },
  });
}
