import { db } from "../firebase/client";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { Poll } from "@/types/database";

const COL = "polls";

export function subscribeActivePoll(
  callback: (poll: Poll | null) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COL), where("isVisible", "==", true));
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        callback(null);
      } else {
        const d = snap.docs[0];
        callback({ id: d.id, ...d.data() } as Poll);
      }
    },
    (err) => {
      console.error("subscribeActivePoll error:", err);
      callback(null);
      onError?.(err);
    }
  );
}

export function subscribeVisiblePolls(callback: (polls: Poll[]) => void) {
  const q = query(collection(db, COL), where("isVisible", "==", true));
  return onSnapshot(q, (snap) => {
    const polls = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Poll[];
    polls.sort((a, b) => {
      const ao = a.order ?? a.createdAt?.toMillis?.() ?? 0;
      const bo = b.order ?? b.createdAt?.toMillis?.() ?? 0;
      return ao - bo;
    });
    callback(polls);
  });
}

export async function setPollVisible(pollId: string, isVisible: boolean): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { isVisible });
}

export async function updatePollOrder(pollId: string, order: number): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { order });
}

export async function updatePoll(
  pollId: string,
  data: { question: string; description?: string; options: Array<{ id: string; label: string }> }
): Promise<void> {
  await updateDoc(doc(db, COL, pollId), {
    question: data.question,
    description: data.description ?? "",
    options: data.options,
  });
}

export function subscribePolls(callback: (polls: Poll[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Poll[]);
  });
}

export async function createPoll(data: {
  question: string;
  description?: string;
  options: Array<{ id: string; label: string }>;
  allowMultiple?: boolean;
  isGuestOnly?: boolean;
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    votes: {},
    multiVotes: {},
    guestVoterInfo: {},
    isActive: false,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function castVote(
  pollId: string,
  userId: string,
  optionId: string,
  voterInfo?: { name: string; team: string; phone: string }
): Promise<void> {
  const update: Record<string, unknown> = { [`votes.${userId}`]: optionId };
  if (voterInfo) update[`guestVoterInfo.${userId}`] = voterInfo;
  await updateDoc(doc(db, COL, pollId), update);
}

export async function castMultiVote(
  pollId: string,
  userId: string,
  optionId: string,
  selected: boolean,
  voterInfo?: { name: string; team: string; phone: string }
): Promise<void> {
  const update: Record<string, unknown> = {
    [`multiVotes.${userId}`]: selected ? arrayUnion(optionId) : arrayRemove(optionId),
  };
  if (voterInfo && selected) update[`guestVoterInfo.${userId}`] = voterInfo;
  await updateDoc(doc(db, COL, pollId), update);
}

export async function togglePollActive(pollId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { isActive });
}

export async function closePoll(pollId: string): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { isActive: false, isClosed: true });
}

export async function unclosePoll(pollId: string): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { isClosed: false });
}

export async function deletePoll(pollId: string): Promise<void> {
  await deleteDoc(doc(db, COL, pollId));
}
