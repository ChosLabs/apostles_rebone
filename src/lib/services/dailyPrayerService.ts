import { db } from "../firebase/client";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { DailyPrayer } from "@/types/database";

const COLLECTION_NAME = "dailyPrayers";

export const setDailyPrayer = async (prayer: Omit<DailyPrayer, 'updatedAt'>) => {
  try {
    const prayerRef = doc(db, COLLECTION_NAME, prayer.id);
    await setDoc(prayerRef, {
      ...prayer,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error setting daily prayer:", error);
    throw error;
  }
};

export const getDailyPrayerByDate = async (dateStr: string): Promise<DailyPrayer | null> => {
  try {
    const prayerRef = doc(db, COLLECTION_NAME, dateStr);
    const prayerSnap = await getDoc(prayerRef);
    
    if (prayerSnap.exists()) {
      return { id: prayerSnap.id, ...prayerSnap.data() } as DailyPrayer;
    }
  } catch (error) {
    console.error("Error fetching daily prayer:", error);
  }
  return null;
};

export const getAllDailyPrayers = async (): Promise<DailyPrayer[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyPrayer));
  } catch (error) {
    console.error("Error fetching all daily prayers:", error);
    return [];
  }
};
