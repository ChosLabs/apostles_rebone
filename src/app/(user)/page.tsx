import { getNotices } from "@/lib/services/noticeService";
import { getTimetable } from "@/lib/services/timetableService";
import HomeClient from "./HomeClient";

export const revalidate = 60; // ISR

export default async function HomePage() {
  const [notices, timetable] = await Promise.all([
    getNotices(),
    getTimetable()
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

  return <HomeClient initialNotices={serializedNotices} initialTimetable={serializedTimetable} />;
}
