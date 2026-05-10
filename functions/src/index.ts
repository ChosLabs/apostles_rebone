import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

initializeApp();
setGlobalOptions({region: "asia-northeast3", maxInstances: 10});

export const sendNoticeNotification = onDocumentCreated(
  "notices/{noticeId}",
  async (event) => {
    const notice = event.data?.data();
    if (!notice) return;

    const db = getFirestore();
    const tokensSnap = await db.collection("fcmTokens").get();
    if (tokensSnap.empty) return;

    const tokens = tokensSnap.docs
      .map((d) => d.data().token as string)
      .filter(Boolean);
    if (tokens.length === 0) return;

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "📢 새 공지사항",
        body: notice.title as string,
      },
      webpush: {
        notification: {
          icon: "https://apostles-rebone.vercel.app/rebon_logo_blue.png",
          tag: "notice-notification",
        },
      },
    });

    const invalidIds = response.responses
      .map((resp, idx) => ({resp, id: tokensSnap.docs[idx].id}))
      .filter(({resp}) => {
        const code = resp.error?.code;
        return (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        );
      })
      .map(({id}) => id);

    if (invalidIds.length > 0) {
      const batch = db.batch();
      invalidIds.forEach((id) =>
        batch.delete(db.collection("fcmTokens").doc(id))
      );
      await batch.commit();
    }
  }
);
