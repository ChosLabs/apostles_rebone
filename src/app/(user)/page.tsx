import { getNotices } from "@/lib/services/noticeService";
import { getTimetableServer } from "@/lib/services/timetableService.server";
import { getDailyPrayerByDateServer } from "@/lib/services/dailyPrayerService.server";
import HomeClient from "./HomeClient";

export const revalidate = 300; // 5-minute ISR cache; daily prayer changes infrequently

function getKSTDateString() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split("T")[0];
}

export default async function HomePage() {
  const today = getKSTDateString();
  const dDayDate = new Date("2026-06-05");
  const now = new Date();
  const diffDays = Math.ceil((dDayDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let notices: Awaited<ReturnType<typeof getNotices>> = [];
  let timetable: Awaited<ReturnType<typeof getTimetableServer>> = [];
  let todayPrayer = null;

  try {
    [notices, timetable, todayPrayer] = await Promise.all([
      getNotices(),
      getTimetableServer(),
      getDailyPrayerByDateServer(today),
    ]);
  } catch {
    // Admin SDK credentials not available at build time.
    // HomeClient real-time listeners will load data on the client.
    try {
      timetable = await getTimetableServer();
    } catch {
      // handled client-side.
    }
  }

  const serializedNotices = notices.map((notice) => {
    const data: any = { ...notice };
    for (const key in data) {
      if (
        data[key] &&
        typeof data[key] === "object" &&
        ("toDate" in data[key] || "_seconds" in data[key])
      ) {
        data[key] = data[key].toDate
          ? data[key].toDate().toISOString()
          : new Date(data[key]._seconds * 1000).toISOString();
      }
    }
    return data;
  });

  const serializedTimetable = timetable.map((item) => JSON.parse(JSON.stringify(item)));

  return (
    <HomeClient
      initialNotices={serializedNotices}
      initialTimetable={serializedTimetable}
      todayPrayer={todayPrayer ? JSON.parse(JSON.stringify(todayPrayer)) : null}
      dDay={diffDays}
    />
  );
}
