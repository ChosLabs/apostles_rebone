import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

function parsePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  key = key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return key;
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  }),
});

const db = getFirestore();

const timetable = [
  // ──────── 1일차 (6/5 금) ────────
  { day: 1, time: "08:00", endTime: "13:00", title: "이동",               type: "move",    location: "" },
  { day: 1, time: "13:00", endTime: "14:00", title: "등록 및 식사",        type: "meal",    location: "" },
  { day: 1, time: "14:00", endTime: "14:30", title: "개회 예배",           type: "worship", location: "" },
  { day: 1, time: "14:30", endTime: "15:30", title: "아이스 브레이킹",     type: "special", location: "" },
  { day: 1, time: "15:30", endTime: "16:10", title: "BIBLE STUDY I",      type: "worship", location: "" },
  { day: 1, time: "16:10", endTime: "16:25", title: "Micro Session",      type: "etc",     location: "" },
  { day: 1, time: "16:25", endTime: "16:55", title: "GBS I",              type: "group",   location: "" },
  { day: 1, time: "16:55", endTime: "18:00", title: "숙소 배정 및 휴식",  type: "etc",     location: "" },
  { day: 1, time: "18:00", endTime: "20:00", title: "저녁식사 및 휴식",   type: "meal",    location: "" },
  { day: 1, time: "20:00", endTime: "20:40", title: "찬양",               type: "worship", location: "" },
  { day: 1, time: "20:40", endTime: "21:20", title: "설교",               type: "worship", location: "" },
  { day: 1, time: "21:20", endTime: "22:20", title: "기도회",             type: "pray",    location: "" },
  { day: 1, time: "22:20", endTime: "22:40", title: "조모임",             type: "group",   location: "" },
  { day: 1, time: "22:40", endTime: "23:00", title: "광고 및 정리",       type: "setup",   location: "" },

  // ──────── 2일차 (6/6 토) ────────
  { day: 2, time: "07:00", endTime: "08:00", title: "아침 건강체조",       type: "special", location: "" },
  { day: 2, time: "08:00", endTime: "10:00", title: "아침식사 및 개인정비", type: "meal",   location: "" },
  { day: 2, time: "10:00", endTime: "10:15", title: "찬양",               type: "worship", location: "" },
  { day: 2, time: "10:15", endTime: "10:55", title: "BIBLE STUDY II",     type: "worship", location: "" },
  { day: 2, time: "10:55", endTime: "11:10", title: "Micro Session",      type: "etc",     location: "" },
  { day: 2, time: "11:10", endTime: "11:40", title: "GBS II",             type: "group",   location: "" },
  { day: 2, time: "11:40", endTime: "13:00", title: "점심식사",            type: "meal",    location: "" },
  { day: 2, time: "13:00", endTime: "13:10", title: "찬양",               type: "worship", location: "" },
  { day: 2, time: "13:10", endTime: "13:20", title: "선택강의 안내",       type: "select",  location: "" },
  { day: 2, time: "13:20", endTime: "13:30", title: "이동",               type: "move",    location: "" },
  { day: 2, time: "13:30", endTime: "15:00", title: "선택강의",            type: "select",  location: "" },
  { day: 2, time: "15:00", endTime: "17:00", title: "콜링 존",             type: "calling", location: "" },
  { day: 2, time: "17:00", endTime: "19:00", title: "식사 및 정비",        type: "meal",    location: "" },
  { day: 2, time: "19:00", endTime: "19:40", title: "찬양",               type: "worship", location: "" },
  { day: 2, time: "19:40", endTime: "20:20", title: "설교",               type: "worship", location: "" },
  { day: 2, time: "20:20", endTime: "21:30", title: "기도회",             type: "pray",    location: "" },
  { day: 2, time: "21:30", endTime: "22:00", title: "조모임",             type: "group",   location: "" },
  { day: 2, time: "22:00", endTime: "23:00", title: "팀플 모임",           type: "group",   location: "" },

  // ──────── 3일차 (6/7 일) ────────
  { day: 3, time: "00:00", endTime: "",       title: "아웃리치",            type: "special", location: "" },
];

async function seed() {
  const col = db.collection("timetable");

  // Check existing
  const existing = await col.get();
  if (!existing.empty) {
    console.log(`⚠️  timetable 컬렉션에 이미 ${existing.size}개 문서가 있습니다.`);
    const answer = process.argv[2];
    if (answer !== "--force") {
      console.log("기존 데이터를 유지하고 중단합니다. 덮어쓰려면 --force 옵션을 사용하세요.");
      process.exit(0);
    }
    console.log("--force: 기존 데이터를 모두 삭제하고 새로 추가합니다.");
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const batch = db.batch();
  const now = Timestamp.now();
  for (const item of timetable) {
    const ref = col.doc();
    batch.set(ref, { ...item, createdAt: now });
  }
  await batch.commit();
  console.log(`✅ ${timetable.length}개 항목을 timetable 컬렉션에 추가했습니다.`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
