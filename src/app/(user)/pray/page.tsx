import { getDailyPrayerByDateServer } from "@/lib/services/dailyPrayerService.server";
import PrayClient from "./PrayClient";

export const revalidate = 60; // ISR

export default async function PrayPage() {
  const today = new Date().toISOString().split('T')[0];
  const dDayDate = new Date("2026-06-05");
  const now = new Date();
  const diffTime = dDayDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const todayPrayer = await getDailyPrayerByDateServer(today);

  return (
    <PrayClient 
      todayPrayer={todayPrayer ? JSON.parse(JSON.stringify(todayPrayer)) : null} 
      dDay={diffDays} 
    />
  );
}
