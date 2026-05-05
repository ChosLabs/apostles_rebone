import { adminDb } from "../firebase/admin";
import { DailyPrayer } from "@/types/database";

const COLLECTION_NAME = "dailyPrayers";

export async function getDailyPrayerByDateServer(dateStr: string): Promise<DailyPrayer | null> {
  try {
    const doc = await adminDb.collection(COLLECTION_NAME).doc(dateStr).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as DailyPrayer;
  } catch (error) {
    console.error("Error fetching daily prayer (server):", error);
    return null;
  }
}
