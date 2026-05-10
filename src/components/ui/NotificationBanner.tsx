'use client';

import { useEffect, useState } from 'react';
import { useNotification } from '@/components/providers/NotificationProvider';

type BannerType = 'ios-guide' | 'android-chrome' | 'permission' | 'denied' | null;

const DISMISSED_KEY = 'rebone_notif_banner_dismissed';

function detectBanner(): BannerType {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;

  if (Notification.permission === 'denied') return 'denied';

  const dismissed = localStorage.getItem(DISMISSED_KEY);
  if (dismissed) return null;

  if (isIOS && !isStandalone) return 'ios-guide';

  if (isAndroid) {
    const isChrome = /chrome/.test(ua) && !/edg|opr|samsung/.test(ua);
    if (!isChrome) return 'android-chrome';
  }

  if (Notification.permission === 'default') return 'permission';

  return null;
}

function openInChrome() {
  const { host, pathname, search, protocol } = window.location;
  const scheme = protocol.replace(':', '');
  window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=${scheme};package=com.android.chrome;end`;
}

export function NotificationBanner() {
  const [banner, setBanner] = useState<BannerType>(null);
  const [requesting, setRequesting] = useState(false);
  const { requestPermissionAndRegister } = useNotification();

  useEffect(() => {
    setBanner(detectBanner());
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setBanner(null);
  }

  async function handleAllow() {
    setRequesting(true);
    const granted = await requestPermissionAndRegister();
    setRequesting(false);
    if (granted) {
      setBanner(null);
    } else {
      localStorage.setItem(DISMISSED_KEY, '1');
      setBanner(null);
    }
  }

  if (!banner) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[388px] bg-white rounded-2xl shadow-lg border border-gray-100 p-4 z-50">
      {banner === 'ios-guide' && (
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">📱</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">공지 알림을 받으려면 앱을 설치하세요</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Safari 하단{' '}
              <span className="inline-block bg-gray-100 rounded px-1 font-medium text-gray-700">공유 ⎙</span>
              {' '}→{' '}
              <span className="inline-block bg-gray-100 rounded px-1 font-medium text-gray-700">홈 화면에 추가</span>
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}

      {banner === 'android-chrome' && (
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🌐</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">Chrome으로 열어주세요</p>
            <p className="text-xs text-gray-500 mt-1">알림을 받으려면 Chrome 브라우저가 필요합니다</p>
            <button
              onClick={openInChrome}
              className="mt-2 text-xs font-semibold text-white bg-[#3182f6] rounded-lg px-3 py-1.5"
            >
              Chrome으로 열기
            </button>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}

      {banner === 'denied' && (
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🔕</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">알림이 차단되어 있어요</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Chrome 주소창 왼쪽 자물쇠 아이콘 → 알림 → 허용
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}

      {banner === 'permission' && (
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🔔</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">새 공지사항 알림을 받으세요</p>
            <p className="text-xs text-gray-500 mt-1">공지가 올라오면 바로 알려드립니다</p>
            <button
              onClick={handleAllow}
              disabled={requesting}
              className="mt-2 text-xs font-semibold text-white bg-[#3182f6] rounded-lg px-3 py-1.5 disabled:opacity-50"
            >
              {requesting ? '처리 중...' : '알림 허용'}
            </button>
          </div>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-sm leading-none p-1"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
