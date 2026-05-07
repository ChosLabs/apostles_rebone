// Run: node --env-file=.env.local scripts/migrate-lectures-zone-type.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1"),
  }),
});

const db = getFirestore();

// title -> { location: zone, lectureType }
const LECTURE_META = {
  "출근길 5분의 기적":                      { location: "ZONE B", lectureType: "실천형" },
  "기도가 안 되는 밤에":                    { location: "ZONE E", lectureType: "나눔형" },
  "그 사람, 신천지입니다":                  { location: "ZONE D", lectureType: "이론형" },
  "오늘의 운세, 오늘의 말씀":              { location: "ZONE D", lectureType: "이론형" },
  "성경이 넷플릭스보다 재밌어지는 법":     { location: "ZONE B", lectureType: "실천형" },
  "ChatGPT에게 성경을 물었더니":           { location: "ZONE D", lectureType: "이론형" },
  "솔직히, 예배가 지루합니다":             { location: "ZONE E", lectureType: "나눔형" },
  "선교사님, 거기서 뭐 드세요?":           { location: "ZONE A", lectureType: "나눔형" },
  "어디까지 가봤니? 북한과 중국":          { location: "ZONE A", lectureType: "실천형" },
  "사회선교, 해봤니?":                      { location: "ZONE A", lectureType: "실천형" },
  "옆자리 외국인 동료에게 복음을?":        { location: "ZONE A", lectureType: "이론형" },
  "내가 있는 곳이 선교지입니다":           { location: "ZONE B", lectureType: "나눔형" },
  "내 전공이 선교 도구가 된다면":          { location: "ZONE B", lectureType: "이론형" },
  "단기선교 A to Z":                        { location: "ZONE A", lectureType: "실천형" },
  "나는 대화가 더 이상 두렵지 않다":       { location: "ZONE C", lectureType: "나눔형" },
  "소개팅 앱 vs 하나님의 타이밍":          { location: "ZONE C", lectureType: "나눔형" },
  "왜 이런 집에 보내셨어요?":              { location: "ZONE E", lectureType: "상담형" },
  "혼자여도 괜찮다는 거짓말":              { location: "ZONE C", lectureType: "나눔형" },
  "교회가 나를 아프게 했을 때":            { location: "ZONE E", lectureType: "나눔형" },
  "결혼은 현실이다":                        { location: "ZONE C", lectureType: "나눔형" },
  "넌 크리스챤과 좋은 관계 맺기":          { location: "ZONE C", lectureType: "이론형" },
  "인스타 속 나는 행복한데 현실은…":       { location: "ZONE E", lectureType: "나눔형" },
  "영끌한 내 통장, 하나님은 뭐라 하실까": { location: "ZONE B", lectureType: "실천형" },
  "월급 200만원으로 독립할 수 있을까":     { location: "ZONE B", lectureType: "이론형" },
  "AI가 설교도 하는 시대, 인간은 왜 필요한가": { location: "ZONE D", lectureType: "이론형" },
  "목사님, 저 우울증인데 기도하면 낫나요?": { location: "ZONE E", lectureType: "상담형" },
  "하나님이 만든 대중문화":                { location: "ZONE D", lectureType: "나눔형" },
  "하나님 저는 어디로 가야할까요?":        { location: "ZONE D", lectureType: "이론형" },
  "죽음을 생각해본 적 있나요?":            { location: "ZONE E", lectureType: "이론형" },
};

async function migrate() {
  const snap = await db.collection("lectures").get();
  let updated = 0, skipped = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const meta = LECTURE_META[data.title];
    if (!meta) { console.log(`⚠️  매칭 안 됨: "${data.title}"`); skipped++; continue; }
    await docSnap.ref.update(meta);
    process.stdout.write(".");
    updated++;
  }
  console.log(`\n✅ 완료! ${updated}개 업데이트, ${skipped}개 스킵.`);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
