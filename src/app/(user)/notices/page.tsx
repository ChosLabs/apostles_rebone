import { getNotices } from "@/lib/services/noticeService";
import NoticesList from "./NoticesList";

export const revalidate = 60;

export default async function NoticesPage() {
  let notices: Awaited<ReturnType<typeof getNotices>> = [];
  try {
    notices = await getNotices();
  } catch {
    // Admin SDK credentials not available at build time.
    // Client-side real-time listener in NoticesList will load data.
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

  return <NoticesList initialNotices={serializedNotices} />;
}
