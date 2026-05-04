import { adminDb } from "../firebase/admin";
import { Notice } from "@/types/database";

export async function getNotices(): Promise<Notice[]> {
  const snapshot = await adminDb.collection("notices")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notice[];
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  const doc = await adminDb.collection("notices").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Notice;
}
