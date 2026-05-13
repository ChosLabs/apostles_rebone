import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const script = `
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || '📢 공지';
  var body  = (payload.notification && payload.notification.body)  || '';
  // SW가 제어하는 탭(앱 자체)만 확인 — includeUncontrolled 제외로 시스템 클라이언트 오판 방지
  return self.clients.matchAll({ type: 'window' })
    .then(function(clients) {
      // 포그라운드 탭이 있으면 페이지의 onForegroundMessage가 처리
      if (clients.some(function(c) { return c.visibilityState === 'visible'; })) return;
      return self.registration.showNotification(title, {
        body: body,
        icon: '/rebon_logo_blue.png',
        badge: '/rebon_logo_blue.png',
      });
    });
});
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache',
    },
  });
}
