import { getNotices } from "@/lib/services/noticeService";
import NoticesList from "./NoticesList";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function NoticesPage() {
  const notices = await getNotices();
  
  // Convert timestamps to plain objects for client component serialization
  const serializedNotices = notices.map(notice => ({
    ...notice,
    createdAt: notice.createdAt?.toDate ? notice.createdAt.toDate().toISOString() : notice.createdAt
  }));

  return <NoticesList initialNotices={serializedNotices as any} />;
}
