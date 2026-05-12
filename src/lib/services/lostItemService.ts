import { db, storage } from "../firebase/client";
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { LostItem } from "@/types/database";

const COL = "lostItems";

export function subscribeLostItems(callback: (items: LostItem[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as LostItem[]);
  });
}

export async function addLostItem(
  file: File,
  description: string
): Promise<void> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `lostItems/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);
  await addDoc(collection(db, COL), {
    imageUrl,
    storagePath,
    description,
    isClaimed: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateDescription(id: string, description: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { description });
}

export async function toggleClaimed(id: string, isClaimed: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), { isClaimed });
}

export async function deleteLostItem(id: string, storagePath?: string): Promise<void> {
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch {
      // 이미 삭제됐거나 경로가 없는 경우 무시
    }
  }
  await deleteDoc(doc(db, COL, id));
}
