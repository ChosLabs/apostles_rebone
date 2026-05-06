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
} from "firebase/firestore";
import { Poll } from "@/types/database";

const COL = "polls";

export function subscribeActivePoll(
  callback: (poll: Poll | null) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, COL), where("isActive", "==", true));
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
}): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    votes: {},
    isActive: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function castVote(
  pollId: string,
  userId: string,
  optionId: string
): Promise<void> {
  await updateDoc(doc(db, COL, pollId), {
    [`votes.${userId}`]: optionId,
  });
}

export async function togglePollActive(pollId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COL, pollId), { isActive });
}

export async function deletePoll(pollId: string): Promise<void> {
  await deleteDoc(doc(db, COL, pollId));
}
