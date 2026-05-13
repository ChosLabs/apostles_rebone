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
  // 포그라운드 탭이 열려있으면 페이지의 onForegroundMessage가 처리 — SW는 표시 생략(중복 방지)
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      if (clients.some(function(c) { return c.visibilityState === 'visible'; })) return;
      var title = (payload.notification && payload.notification.title) || '📢 공지';
      var body  = (payload.notification && payload.notification.body)  || '';
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
