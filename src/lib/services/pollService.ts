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
  getDoc,
  getDocs,
  writeBatch,
  increment,
} from "firebase/firestore";
import { Poll, UserVote, GuestCandidate } from "@/types/database";

const COL = "polls";
const voteRef = (pollId: string, userId: string) => doc(db, COL, pollId, "votes", userId);
const votesCol = (pollId: string) => collection(db, COL, pollId, "votes");

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
    voteCounts: {},
    totalVoters: 0,
    isActive: false,
    order: Date.now(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * 단일 선택 투표.
 * prevOptionId: 기존 투표 선택지 (변경 시 카운트 차감), null이면 최초 투표.
 */
export async function castVote(
  pollId: string,
  userId: string,
  optionId: string,
  prevOptionId: string | null,
  voterInfo?: { name: string; team: string; phone: string }
): Promise<void> {
  const batch = writeBatch(db);

  batch.set(voteRef(pollId, userId), {
    optionId,
    ...(voterInfo ? { voterInfo } : {}),
    votedAt: serverTimestamp(),
  });

  const countUpdates: Record<string, unknown> = {
    [`voteCounts.${optionId}`]: increment(1),
  };
  if (prevOptionId) {
    // 투표 변경: 기존 선택지 차감, 신규 선택지 증가, totalVoters 유지
    countUpdates[`voteCounts.${prevOptionId}`] = increment(-1);
  } else {
    // 최초 투표: 참여자 수 증가
    countUpdates.totalVoters = increment(1);
  }
  batch.update(doc(db, COL, pollId), countUpdates);

  await batch.commit();
}

/**
 * 복수 선택 투표.
 * prevOptionIds: 현재 선택된 선택지 목록.
 */
export async function castMultiVote(
  pollId: string,
  userId: string,
  optionId: string,
  selecting: boolean,
  prevOptionIds: string[],
  voterInfo?: { name: string; team: string; phone: string }
): Promise<void> {
  const batch = writeBatch(db);
  const nextOptionIds = selecting
    ? [...prevOptionIds, optionId]
    : prevOptionIds.filter((id) => id !== optionId);

  if (nextOptionIds.length === 0) {
    batch.delete(voteRef(pollId, userId));
  } else {
    batch.set(voteRef(pollId, userId), {
      optionIds: nextOptionIds,
      ...(voterInfo && selecting ? { voterInfo } : {}),
      votedAt: serverTimestamp(),
    });
  }

  const countUpdates: Record<string, unknown> = {
    [`voteCounts.${optionId}`]: increment(selecting ? 1 : -1),
  };
  if (selecting && prevOptionIds.length === 0) {
    countUpdates.totalVoters = increment(1);
  } else if (!selecting && prevOptionIds.length === 1) {
    countUpdates.totalVoters = increment(-1);
  }
  batch.update(doc(db, COL, pollId), countUpdates);

  await batch.commit();
}

/** 유저의 특정 투표 응답을 단건 조회 */
export async function fetchUserVote(pollId: string, userId: string): Promise<UserVote | null> {
  const snap = await getDoc(voteRef(pollId, userId));
  return snap.exists() ? (snap.data() as UserVote) : null;
}

/** 어드민: 특정 선택지를 고른 투표자 목록 조회 */
export async function fetchVotersForOption(
  pollId: string,
  optionId: string,
  isMultiple: boolean
): Promise<Array<GuestCandidate>> {
  const snap = await getDocs(votesCol(pollId));
  return snap.docs
    .filter((d) => {
      const data = d.data() as UserVote;
      return isMultiple ? data.optionIds?.includes(optionId) : data.optionId === optionId;
    })
    .map((d) => {
      const data = d.data() as UserVote;
      return {
        guestId: d.id,
        name: data.voterInfo?.name ?? "",
        team: data.voterInfo?.team ?? "",
        phone: data.voterInfo?.phone ?? "",
      };
    });
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

/** 투표 기록 전체 초기화: 서브컬렉션 삭제 + 집계 리셋 */
export async function resetPollVotes(pollId: string): Promise<void> {
  const allDocs = (await getDocs(votesCol(pollId))).docs;
  for (let i = 0; i < allDocs.length; i += 499) {
    const batch = writeBatch(db);
    allDocs.slice(i, i + 499).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  await updateDoc(doc(db, COL, pollId), { voteCounts: {}, totalVoters: 0 });
}
