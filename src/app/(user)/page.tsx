import { getNotices } from "@/lib/services/noticeService";
import HomeClient from "./HomeClient";

export const revalidate = 60; // ISR

export default async function HomePage() {
  const notices = await getNotices();
  
  // Convert timestamps to plain objects
  const serializedNotices = notices.map(notice => ({
    ...notice,
    createdAt: notice.createdAt?.toDate ? notice.createdAt.toDate().toISOString() : notice.createdAt
  }));

  return <HomeClient initialNotices={serializedNotices as any} />;
}
