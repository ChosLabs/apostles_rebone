import { NextResponse } from 'next/server';

export async function GET() {
  // Firebase compat SW를 제거하고 표준 push 이벤트 핸들러 사용.
  // onBackgroundMessage는 앱이 완전히 닫혔을 때 신뢰성 문제가 있어서 raw push 이벤트로 대체.
  // 포그라운드 탭이 있으면 postMessage로 페이지에 전달하고, 없으면 직접 showNotification.
  const script = `
self.addEventListener('push', function(event) {
  if (!event.data) return;

  var payload;
  try { payload = event.data.json(); } catch(e) { return; }

  var notif  = payload.notification || {};
  var title  = notif.title || '📢 공지';
  var body   = notif.body  || '';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      var visible = clients.filter(function(c) { return c.visibilityState === 'visible'; });
      if (visible.length > 0) {
        visible.forEach(function(c) {
          c.postMessage({ type: 'PUSH_RECEIVED', title: title, body: body });
        });
        return;
      }
      return self.registration.showNotification(title, {
        body: body,
        icon: '/rebon_logo_blue.png',
        badge: '/rebon_logo_blue.png',
      });
    })
  );
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
