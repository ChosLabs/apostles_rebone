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
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  where,
  setDoc,
} from "firebase/firestore";
import { Lecture } from "@/types/database";

const COL = "lectures";
const SETTINGS_DOC = "config/lectureSettings";

export function subscribeLectures(callback: (lectures: Lecture[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Lecture[]);
  });
}

export function subscribeLectureSettings(callback: (isOpen: boolean) => void) {
  const ref = doc(db, "config", "lectureSettings");
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data().isRegistrationOpen ?? false) : false);
  });
}

export async function addLecture(
  data: Omit<Lecture, "id" | "applicantIds" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    applicantIds: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLecture(
  id: string,
  data: Partial<Omit<Lecture, "id" | "applicantIds" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteLecture(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function applyLecture(lectureId: string, userId: string): Promise<void> {
  const alreadyApplied = await getDocs(
    query(collection(db, COL), where("applicantIds", "array-contains", userId))
  );
  if (!alreadyApplied.empty) throw new Error("강의는 1개만 신청할 수 있습니다.");

  const ref = doc(db, COL, lectureId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("강의를 찾을 수 없습니다.");
  const lecture = snap.data() as Lecture;
  if (lecture.applicantIds.length >= lecture.capacity) throw new Error("정원이 마감되었습니다.");
  await updateDoc(ref, { applicantIds: arrayUnion(userId) });
}

export async function cancelLecture(lectureId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, COL, lectureId), { applicantIds: arrayRemove(userId) });
}

export async function setRegistrationOpen(isOpen: boolean): Promise<void> {
  await setDoc(doc(db, "config", "lectureSettings"), { isRegistrationOpen: isOpen }, { merge: true });
}
