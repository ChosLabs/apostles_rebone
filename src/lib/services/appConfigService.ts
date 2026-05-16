import { db } from "../firebase/client";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const CONFIG_REF = () => doc(db, "appConfig", "settings");

// ── 내부 싱글톤 구독 ─────────────────────────────────────────
// subscribeGuestMode / subscribeDarkModeLocked 가 각각 onSnapshot을 열던 것을
// 하나의 Firestore 연결로 통합. 1200명 × 2리스너 → 1200명 × 1리스너.

type ConfigPayload = { guestModeEnabled: boolean; darkModeLocked: boolean };
type ConfigListener = (config: ConfigPayload, fromCache: boolean) => void;

const configListeners = new Set<ConfigListener>();
let configUnsub: (() => void) | null = null;

function ensureConfigSubscription() {
  if (configUnsub) return;
  configUnsub = onSnapshot(
    CONFIG_REF(),
    { includeMetadataChanges: true },
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const payload: ConfigPayload = {
        guestModeEnabled: Boolean(data?.guestModeEnabled),
        darkModeLocked: Boolean(data?.darkModeLocked),
      };
      const fromCache = snap.metadata.fromCache;
      configListeners.forEach((cb) => cb(payload, fromCache));
    }
  );
}

function addConfigListener(cb: ConfigListener): () => void {
  configListeners.add(cb);
  ensureConfigSubscription();
  return () => {
    configListeners.delete(cb);
    if (configListeners.size === 0 && configUnsub) {
      configUnsub();
      configUnsub = null;
    }
  };
}

// ── 공개 API (기존 시그니처 유지) ────────────────────────────

export async function setGuestMode(enabled: boolean) {
  await setDoc(CONFIG_REF(), { guestModeEnabled: enabled }, { merge: true });
}

export async function setDarkModeLocked(locked: boolean) {
  await setDoc(CONFIG_REF(), { darkModeLocked: locked }, { merge: true });
}

export function subscribeGuestMode(cb: (enabled: boolean, fromCache: boolean) => void) {
  return addConfigListener((config, fromCache) => cb(config.guestModeEnabled, fromCache));
}

export function subscribeDarkModeLocked(cb: (locked: boolean) => void) {
  return addConfigListener((config) => cb(config.darkModeLocked));
}

// 알림 초기화 시각 조회 (ms timestamp, 없으면 0)
export async function getNotifResetAt(): Promise<number> {
  const snap = await getDoc(CONFIG_REF());
  if (!snap.exists()) return 0;
  const val = snap.data()?.notifResetAt;
  if (!val) return 0;
  if (typeof val === "number") return val;
  return val?.toMillis?.() ?? 0;
}
