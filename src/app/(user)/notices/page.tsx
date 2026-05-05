import { getNotices } from "@/lib/services/noticeService";
import NoticesList from "./NoticesList";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function NoticesPage() {
  const notices = await getNotices();
  
  // Convert all timestamp fields to ISO strings
  const serializedNotices = notices.map(notice => {
    const data: any = { ...notice };
    for (const key in data) {
      if (data[key] && typeof data[key] === 'object' && ('toDate' in data[key] || '_seconds' in data[key])) {
        data[key] = data[key].toDate ? data[key].toDate().toISOString() : new Date(data[key]._seconds * 1000).toISOString();
      }
    }
    return data;
  });

  return <NoticesList initialNotices={serializedNotices} />;
}
