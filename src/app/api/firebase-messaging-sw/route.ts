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

// Firebase compat은 앱이 포그라운드일 때 onMessage(페이지)로 라우팅하고
// 백그라운드/종료 상태일 때만 onBackgroundMessage를 호출한다.
// 따라서 여기서는 추가 클라이언트 확인 없이 즉시 알림 표시.
messaging.onBackgroundMessage(function(payload) {
  var title = (payload.notification && payload.notification.title) || '📢 공지';
  var body  = (payload.notification && payload.notification.body)  || '';
  return self.registration.showNotification(title, {
    body: body,
    icon: '/rebon_logo_blue.png',
    badge: '/rebon_logo_blue.png',
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
