import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

function parsePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }),
});

const db = getFirestore();

// ──────────────────────────────────────────────
// 12개 파송교회 데이터 (church.pdf 기반)
// assignedGroups는 어드민에서 추후 배정
// ──────────────────────────────────────────────
const churches = [
  {
    name: "푸른솔 교회",
    address: "이동시간 약 3시간 (대형버스 주차 가능, 교회까지 도보 3분)",
    worshipTime: "11:00–12:00, 14:00–14:20",
    activities: "예배 2회 · 점심식사 · 교제(레크레이션) 또는 전도 — 마을 전체 방문, 전도용품 150개",
    assignedGroups: [],
  },
  {
    name: "청송읍 교회",
    address: "이동시간 약 3시간 (대형버스 주차 가능, 강변 주정차 가능, 도보 5분)",
    worshipTime: "11:00–12:00, 14:00–14:20",
    activities: "예배 2회 · 점심식사 · 전도 — 전도용품 200개",
    assignedGroups: [],
  },
  {
    name: "중평평화 교회",
    address: "이동시간 약 2시간 50분 (들꽃카페 앞 주차 가능, 도보 3분)",
    worshipTime: "10:30–11:30, 13:00–13:30",
    activities: "예배 2회 · 점심식사 · 환경미화 — 교회주변 정리·청소, 폐자재 정리, 옥상청소",
    assignedGroups: [],
  },
  {
    name: "성지교회",
    address: "이동시간 약 2시간 50분 (교회 근처 공터 주차 가능)",
    worshipTime: "11:00–12:00",
    activities: "예배 · 점심식사(마당) · 레크레이션 및 주민 위로 초청잔치 (성도 15명 + 초청주민 10명)",
    assignedGroups: [],
  },
  {
    name: "송생교회",
    address: "이동시간 약 2시간 50분 (외부 길가에서 도보 10분)",
    worshipTime: "11:00–11:40",
    activities: "예배 · 점심식사 · 교제 및 레크레이션 — 오후예배 없음, 전도키트 70개",
    assignedGroups: [],
  },
  {
    name: "부남교회",
    address: "이동시간 약 3시간 (교회 앞 주차 확인 필요)",
    worshipTime: "11:00–12:30",
    activities: "예배(초청잔치·복음 전도 프로그램) · 점심식사 · 레크레이션 및 주민 위로 — 전도키트 70개",
    assignedGroups: [],
  },
  {
    name: "부남중앙교회",
    address: "이동시간 약 3시간 (근처 농협 주차장 이용, 도보 5분)",
    worshipTime: "11:00–12:00, 13:30–14:30",
    activities: "예배 2회 · 점심식사 · 페인트 작업 — 장비 및 소모품 구매 필요 (담당: 손형곤)",
    assignedGroups: [],
  },
  {
    name: "화정교회",
    address: "이동시간 약 3시간 10분 (갓길 하차 후 도보 2–5분)",
    worshipTime: "10:30–11:00 찬양, 11:00–11:50 예배",
    activities: "찬양 · 예배(초청잔치·복음 전도 프로그램) · 점심식사 · 전도 — 전도용품 없음",
    assignedGroups: [],
  },
  {
    name: "중기교회",
    address: "이동시간 약 2시간 50분 (교회 앞마당 주차 가능)",
    worshipTime: "11:00–12:00",
    activities: "예배 · 점심식사 · 전도 — 120가구 가가호호 방문, 전도물품 100개",
    assignedGroups: [],
  },
  {
    name: "행복한교회",
    address: "이동시간 약 2시간 50분 (도보 10분, 주차공간 확인 필요)",
    worshipTime: "11:00–12:00",
    activities: "예배 · 점심식사 · 청소 및 말벗 이야기 나눔 — 어르신 말벗팀·청소팀 2팀 운영",
    assignedGroups: [],
  },
  {
    name: "영동교회",
    address: "이동시간 약 2시간 50분 (주차장 확인 필요)",
    worshipTime: "11:00–12:00, 13:30–14:30",
    activities: "예배 2회 · 점심 및 시설정비 — 목양실 판넬 공사, 꽃밭 조성, 교회 외부 청소(쓰레기·잡초 제거)",
    assignedGroups: [],
  },
  {
    name: "청송교회",
    address: "이동시간 약 2시간 50분 (도보 10분)",
    worshipTime: "11:00–12:00",
    activities: "예배 · 점심식사 · 청소년 찬양집회 — 청소년 70명 예상, 찬양팀 별도 구성, 행운권 선물",
    assignedGroups: [],
  },
];

async function seed() {
  const col = db.collection("dispatchedChurches");
  const existing = await col.get();

  if (!existing.empty) {
    console.log(`⚠️  dispatchedChurches 컬렉션에 이미 ${existing.size}개 문서가 있습니다.`);
    if (process.argv[2] !== "--force") {
      console.log("기존 데이터를 유지하고 중단합니다. 덮어쓰려면 --force 옵션을 사용하세요.");
      process.exit(0);
    }
    console.log("--force: 기존 데이터를 모두 삭제하고 새로 추가합니다.");
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const now = Timestamp.now();
  const batch = db.batch();
  for (const church of churches) {
    batch.set(col.doc(), { ...church, createdAt: now });
  }
  await batch.commit();
  console.log(`✅ ${churches.length}개 파송교회를 dispatchedChurches 컬렉션에 추가했습니다.`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
