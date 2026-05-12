import { db, storage } from "../firebase/client";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, getDoc, setDoc, getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { InventoryCategory, InventoryItem, InventoryManager } from "@/types/database";

const CATEGORIES = "inventoryCategories";
const ITEMS = "inventoryItems";
const MANAGERS = "inventoryManagers";

// ── Categories ────────────────────────────────────────────────
export function subscribeCategories(cb: (data: InventoryCategory[]) => void) {
  return onSnapshot(
    query(collection(db, CATEGORIES), orderBy("createdAt", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as InventoryCategory[])
  );
}

export async function addCategory(name: string) {
  await addDoc(collection(db, CATEGORIES), { name, createdAt: serverTimestamp() });
}

export async function updateCategory(id: string, name: string) {
  await updateDoc(doc(db, CATEGORIES, id), { name });
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, CATEGORIES, id));
}

// ── Items ─────────────────────────────────────────────────────
export function subscribeItems(cb: (data: InventoryItem[]) => void) {
  return onSnapshot(
    query(collection(db, ITEMS), orderBy("createdAt", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as InventoryItem[])
  );
}

export async function addItem(
  file: File,
  name: string,
  categoryId: string,
  categoryName: string,
  initialQuantity: number,
  registeredById: string,
  registeredByName: string,
) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `inventoryItems/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);
  await addDoc(collection(db, ITEMS), {
    name, imageUrl, storagePath,
    categoryId, categoryName,
    initialQuantity, currentQuantity: initialQuantity,
    registeredById, registeredByName,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
}

export async function updateItemQuantity(id: string, currentQuantity: number) {
  await updateDoc(doc(db, ITEMS, id), { currentQuantity, updatedAt: serverTimestamp() });
}

export async function updateItemInfo(
  id: string,
  data: { name?: string; categoryId?: string; categoryName?: string; initialQuantity?: number },
  file?: File,
  oldStoragePath?: string,
) {
  let extra: Record<string, unknown> = {};
  if (file) {
    if (oldStoragePath) {
      try { await deleteObject(ref(storage, oldStoragePath)); } catch {}
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `inventoryItems/${Date.now()}_${safeName}`;
    await uploadBytes(ref(storage, storagePath), file);
    extra.imageUrl = await getDownloadURL(ref(storage, storagePath));
    extra.storagePath = storagePath;
  }
  await updateDoc(doc(db, ITEMS, id), { ...data, ...extra, updatedAt: serverTimestamp() });
}

export async function deleteItem(id: string, storagePath?: string) {
  if (storagePath) {
    try { await deleteObject(ref(storage, storagePath)); } catch {}
  }
  await deleteDoc(doc(db, ITEMS, id));
}

// ── Managers ──────────────────────────────────────────────────
export function subscribeManagers(cb: (data: InventoryManager[]) => void) {
  return onSnapshot(
    query(collection(db, MANAGERS), orderBy("addedAt", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as InventoryManager[])
  );
}

export async function isInventoryManager(userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, MANAGERS, userId));
  return snap.exists();
}

export async function addManager(participantId: string, name: string) {
  await setDoc(doc(db, MANAGERS, participantId), { name, addedAt: serverTimestamp() });
}

export async function removeManager(participantId: string) {
  await deleteDoc(doc(db, MANAGERS, participantId));
}
