import { db } from "../firebase/client";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit,
  onSnapshot
} from "firebase/firestore";
import { PrayerRequest, User } from "@/types/database";

const COLLECTION_NAME = "prayers";

export const addPrayerRequest = async (user: User, content: string, type: 'all' | 'group', isAnonymous: boolean) => {
  const prayerData = {
    userId: user.uid,
    userName: isAnonymous ? "익명" : user.name,
    userTeam: user.team || "",
    userBirthYear: user.birthYear || "",
    userPhone: user.phone ? user.phone.replace(/-/g, "").slice(-4) : "",
    group: user.group?.toString() || "",
    content,
    type,
    likes: [],
    createdAt: serverTimestamp(),
  };

  return await addDoc(collection(db, COLLECTION_NAME), prayerData);
};

export const getAllPrayers = async (count: number = 50): Promise<PrayerRequest[]> => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("type", "==", "all"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
};

export const getGroupPrayers = async (groupNumber: string): Promise<PrayerRequest[]> => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("group", "==", groupNumber),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
};

export const getMyPrayers = async (userId: string): Promise<PrayerRequest[]> => {
  const q = query(
    collection(db, COLLECTION_NAME), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest));
};

export const togglePrayLike = async (prayerId: string, userId: string, hasPrayed: boolean) => {
  const prayerRef = doc(db, COLLECTION_NAME, prayerId);
  await updateDoc(prayerRef, {
    likes: hasPrayed ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const subscribeAllPrayers = (callback: (prayers: PrayerRequest[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PrayerRequest)));
  });
};

export const deletePrayer = async (prayerId: string) => {
  await deleteDoc(doc(db, COLLECTION_NAME, prayerId));
};
