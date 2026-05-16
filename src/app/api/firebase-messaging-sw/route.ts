import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const script = `
// ── 즉시 활성화 ──────────────────────────────────────────────
self.addEventListener('install',  function()      { self.skipWaiting(); });
self.addEventListener('activate', function(event) { event.waitUntil(self.clients.claim()); });

// ── push 핸들러를 Firebase보다 먼저 등록 ──────────────────────
// Firebase compat도 push 리스너를 등록하는데, stopImmediatePropagation()으로
// Firebase의 핸들러가 실행되지 않도록 막아 중복 알림을 방지.
self.addEventListener('push', function(event) {
  event.stopImmediatePropagation();

  var title = '📢 공지';
  var body  = '';
  if (event.data) {
    try {
      var d = event.data.json();
      var n = d.notification || d.data || {};
      title = n.title || title;
      body  = n.body  || body;
    } catch (e) {}
  }

  event.waitUntil(
    // includeUncontrolled: true — SW 업데이트 직후 아직 claim되지 않은 탭도 포함
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
      // visibilityState 기준으로 앱 가시성 판단.
      // c.focused는 Android에서 홈버튼 전환 타이밍에 true를 오반환하는 케이스가 있어
      // visibilityState === 'visible'로 교체. 홈버튼 누르면 즉시 'hidden'으로 전환됨.
      var visible = clients.filter(function(c) { return c.visibilityState === 'visible'; });
      if (visible.length > 0) {
        // 앱이 화면에 표시 중 → 페이지로 전달해 인앱 알림 표시
        visible.forEach(function(c) {
          c.postMessage({ type: 'PUSH_RECEIVED', title: title, body: body });
        });
        return;
      }
      // 앱이 백그라운드/종료 상태 → SW가 직접 시스템 알림 표시
      return self.registration.showNotification(title, {
        body: body,
        icon: '/rebon_logo_blue.png',
        badge: '/rebon_logo_blue.png',
      });
    })
  );
});

// ── Firebase compat 초기화 (getToken 푸시 구독 유지 목적) ─────
// push 핸들러는 위에서 이미 처리되므로 onBackgroundMessage는 등록하지 않음
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
firebase.initializeApp(${JSON.stringify(config)});
firebase.messaging();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-cache',
    },
  });
}
