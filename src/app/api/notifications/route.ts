import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase/admin";

// POST — 전체 기기에 알림 전송
export async function POST(req: NextRequest) {
  try {
    const { title, body, source = "manual" } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }

    const snap = await adminDb.collection("fcmTokens").get();
    const tokens = snap.docs
      .map((d) => d.data().token as string)
      .filter(Boolean);

    const totalTokens = tokens.length;
    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    if (totalTokens > 0) {
      // FCM 최대 500개씩 전송
      for (let i = 0; i < tokens.length; i += 500) {
        const chunk = tokens.slice(i, i + 500);
        const result = await adminMessaging.sendEachForMulticast({
          tokens: chunk,
          notification: { title, body },
          webpush: {
            headers: { Urgency: "high", TTL: "86400" },
            notification: {
              icon: "/rebon_logo_blue.png",
              badge: "/rebon_logo_blue.png",
            },
          },
        });
        successCount += result.successCount;
        failureCount += result.failureCount;
        result.responses.forEach((resp, idx) => {
          if (!resp.success) invalidTokens.push(chunk[idx]);
        });
      }

    }

    // 히스토리 저장 — FCM 전송 완료 즉시 응답, 토큰 정리는 백그라운드 처리
    const historyPromise = adminDb.collection("notificationHistory").add({
      title,
      body,
      sentAt: new Date(),
      totalTokens,
      sent: successCount,
      failed: failureCount,
      source,
    });

    // 무효 토큰 정리: doc ID = token 이므로 쿼리 없이 직접 삭제
    const cleanupPromise = (async () => {
      if (invalidTokens.length === 0) return;
      for (let i = 0; i < invalidTokens.length; i += 400) {
        const batch = adminDb.batch();
        invalidTokens.slice(i, i + 400).forEach((token) => {
          batch.delete(adminDb.collection("fcmTokens").doc(token));
        });
        await batch.commit();
      }
    })();

    await Promise.all([historyPromise, cleanupPromise]);

    return NextResponse.json({ sent: successCount, failed: failureCount });
  } catch (err) {
    console.error("[send-notification]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — 전체 FCM 토큰 초기화 + 초기화 시각 기록
export async function DELETE() {
  try {
    const snap = await adminDb.collection("fcmTokens").get();
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = adminDb.batch();
      snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    // 클라이언트가 초기화 시각 이전에 등록된 토큰을 자동 재사용하지 않도록 시각 기록
    await adminDb.doc("appConfig/settings").set(
      { notifResetAt: Date.now() },
      { merge: true }
    );
    return NextResponse.json({ cleared: snap.size });
  } catch (err: any) {
    console.error("[clear-tokens]", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}

// GET — 등록된 기기 수 조회
export async function GET() {
  try {
    const snap = await adminDb.collection("fcmTokens").get();
    return NextResponse.json({ count: snap.size });
  } catch (err) {
    console.error("[get-token-count]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
