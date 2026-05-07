import { getDailyPrayerByDateServer } from "@/lib/services/dailyPrayerService.server";
import PrayClient from "./PrayClient";

export const revalidate = 60;

export default async function PrayPage() {
  const today = new Date().toISOString().split("T")[0];
  const dDayDate = new Date("2026-06-05");
  const now = new Date();
  const diffDays = Math.ceil((dDayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let todayPrayer = null;
  try {
    todayPrayer = await getDailyPrayerByDateServer(today);
  } catch {
    // Admin SDK credentials not available at build time.
    // PrayClient will handle data loading client-side.
  }

  return (
    <PrayClient
      todayPrayer={todayPrayer ? JSON.parse(JSON.stringify(todayPrayer)) : null}
      dDay={diffDays}
    />
  );
}
