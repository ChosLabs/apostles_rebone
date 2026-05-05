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
  getDocs,
} from "firebase/firestore";
import { LuckyDraw, LuckyDrawWinner, Participant } from "@/types/database";

const COL = "luckyDraws";

export function subscribeLuckyDraws(callback: (draws: LuckyDraw[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LuckyDraw[]);
  });
}

export async function createLuckyDraw(data: {
  title: string;
  targetTeams: string[];
  targetGroups: number[];
  winnerCount: number;
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "pending",
    winners: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function startDraw(drawId: string): Promise<void> {
  await updateDoc(doc(db, COL, drawId), { status: "drawing" });
}

export async function completeDraw(draw: LuckyDraw): Promise<void> {
  const snap = await getDocs(collection(db, "participants"));
  let participants = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Participant[];

  if (draw.targetTeams.length > 0) {
    participants = participants.filter((p) => draw.targetTeams.includes(p.team));
  }
  if (draw.targetGroups.length > 0) {
    participants = participants.filter(
      (p) => p.group !== undefined && draw.targetGroups.includes(p.group)
    );
  }

  // Fisher-Yates shuffle
  for (let i = participants.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [participants[i], participants[j]] = [participants[j], participants[i]];
  }

  const winners: LuckyDrawWinner[] = participants
    .slice(0, draw.winnerCount)
    .map((p) => ({
      userId: p.id,
      userName: p.name,
      userTeam: p.team,
      userGroup: p.group || 0,
    }));

  await updateDoc(doc(db, COL, draw.id), { status: "completed", winners });
}

export async function deleteLuckyDraw(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
