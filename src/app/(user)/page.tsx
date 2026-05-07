import { getNotices } from "@/lib/services/noticeService";
import { getTimetable } from "@/lib/services/timetableService";
import { getDailyPrayerByDateServer } from "@/lib/services/dailyPrayerService.server";
import HomeClient from "./HomeClient";

export const revalidate = 300; // 5-minute ISR cache; daily prayer changes infrequently

function getKSTDateString() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
}

export default async function HomePage() {
  const today = getKSTDateString();
  const dDayDate = new Date("2026-06-05");
  const now = new Date();
  const diffTime = dDayDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const [notices, timetable, todayPrayer] = await Promise.all([
    getNotices(),
    getTimetable(),
    getDailyPrayerByDateServer(today)
  ]);
  
  // Convert timestamps to plain strings for all date fields
  const serializedNotices = notices.map(notice => {
    const data: any = { ...notice };
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && ('toDate' in data[key] || '_seconds' in data[key])) {
        data[key] = data[key].toDate ? data[key].toDate().toISOString() : new Date(data[key]._seconds * 1000).toISOString();
      }
    }
    return data;
  });

  const serializedTimetable = timetable.map(item => {
    const data: any = { ...item };
    // Handle any timestamps if they exist (though currently none in TimetableItem)
    return data;
  });

  return (
    <HomeClient 
      initialNotices={serializedNotices} 
      initialTimetable={serializedTimetable} 
      todayPrayer={todayPrayer ? JSON.parse(JSON.stringify(todayPrayer)) : null}
      dDay={diffDays}
    />
  );
}
