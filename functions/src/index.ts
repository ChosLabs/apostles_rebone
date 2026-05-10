import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
import {logger} from "firebase-functions";
import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

initializeApp();
setGlobalOptions({region: "asia-northeast3", maxInstances: 10});

export const sendNoticeNotification = onDocumentCreated(
  "notices/{noticeId}",
  async (event) => {
    const notice = event.data?.data();
    logger.info("sendNoticeNotification triggered", {
      noticeId: event.params.noticeId,
      title: notice?.title,
    });

    if (!notice) {
      logger.warn("Notice data is empty, skipping");
      return;
    }

    const db = getFirestore();
    const tokensSnap = await db.collection("fcmTokens").get();
    logger.info(`fcmTokens count: ${tokensSnap.size}`);

    if (tokensSnap.empty) {
      logger.warn("No FCM tokens registered — skipping push");
      return;
    }

    const tokenDocs = tokensSnap.docs
      .map((d) => ({id: d.id, token: d.data().token as string}))
      .filter((d) => Boolean(d.token));

    if (tokenDocs.length === 0) {
      logger.warn("All token fields were empty");
      return;
    }

    const response = await getMessaging().sendEachForMulticast({
      tokens: tokenDocs.map((d) => d.token),
      notification: {
        title: "📢 새 공지사항",
        body: notice.title as string,
      },
      webpush: {
        notification: {
          icon: "https://apostles-rebone.vercel.app/rebon_logo_blue.png",
          tag: "notice-notification",
        },
        fcmOptions: {link: "https://apostles-rebone.vercel.app/notices"},
      },
    });

    logger.info("FCM result", {
      success: response.successCount,
      failure: response.failureCount,
    });

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        logger.warn("FCM send failed", {
          token: tokenDocs[idx].token.slice(0, 20) + "...",
          error: resp.error?.code,
          message: resp.error?.message,
        });
      }
    });

    const invalidIds = response.responses
      .map((resp, idx) => ({resp, id: tokenDocs[idx].id}))
      .filter(({resp}) => {
        const code = resp.error?.code;
        return (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-argument"
        );
      })
      .map(({id}) => id);

    if (invalidIds.length > 0) {
      logger.info(`Removing ${invalidIds.length} invalid token(s)`);
      const batch = db.batch();
      invalidIds.forEach((id) =>
        batch.delete(db.collection("fcmTokens").doc(id))
      );
      await batch.commit();
    }
  }
);
