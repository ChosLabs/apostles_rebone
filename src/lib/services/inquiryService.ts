import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export interface InquiryData {
  id: string;
  userId: string;
  userName: string;
  userGroup: string;
  categoryName: string;
  title: string;
  content: string;
  status: "pending" | "answered";
  createdAt: any;
  answer?: string;
  answeredAt?: any;
}

const COLL = "inquiries";

export async function addInquiry(data: Omit<InquiryData, "id" | "status" | "createdAt">) {
  await addDoc(collection(db, COLL), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export function subscribeInquiries(callback: (list: InquiryData[]) => void) {
  const q = query(collection(db, COLL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as InquiryData)));
  });
}

export function subscribeUserInquiries(userId: string, callback: (list: InquiryData[]) => void) {
  const q = query(collection(db, COLL), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as InquiryData))
      .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    callback(list);
  });
}

export async function answerInquiry(id: string, answer: string) {
  await updateDoc(doc(db, COLL, id), {
    status: "answered",
    answer,
    answeredAt: serverTimestamp(),
  });
}
