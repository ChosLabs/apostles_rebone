// Run: node --env-file=.env.local scripts/seed-lectures.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"(.*)"$/, "$1"),
  }),
});

const db = getFirestore();

const lectures = [
  // 트랙 1: Re:本
  { title: "출근길 5분의 기적", lecturer: "교역자", location: "", description: "바쁜 직장인을 위한 QT & 기도 루틴 실전 셋업", capacity: 30 },
  { title: "기도가 안 되는 밤에", lecturer: "교역자", location: "", description: "부르짖는 기도부터 침묵 기도까지, 막힌 영적 호흡 뚫기", capacity: 30 },
  { title: "그 사람, 신천지입니다", lecturer: "이단상담 전문가", location: "", description: "청년 타겟 이단의 2026 최신 포교 수법 해부와 대처법", capacity: 30 },
  { title: "오늘의 운세, 오늘의 말씀", lecturer: "변증학 전공/교역자", location: "", description: "다원주의 시대, 크리스천임을 지혜롭게 밝히고 사는 변증 실습", capacity: 30 },
  { title: "성경이 넷플릭스보다 재밌어지는 법", lecturer: "교역자", location: "", description: "통독이 지루한 청년을 위한 맥(脈) 잡기 현실 가이드", capacity: 30 },
  { title: "ChatGPT에게 성경을 물었더니", lecturer: "교역자/IT전문가", location: "", description: "AI가 해석도 해주는 시대, 어떻게 활용해야 하는가. 말씀 묵상의 고유한 차원 재발견", capacity: 30 },
  { title: "솔직히, 예배가 지루합니다", lecturer: "교역자", location: "", description: "관람객에서 참여자로 — 예배 감각 회복 자기진단 워크숍", capacity: 30 },

  // 트랙 2: Re:born — 내 일상이 선교지다
  { title: "선교사님, 거기서 뭐 드세요?", lecturer: "아포슬 장단기 선교사", location: "", description: "타문화권 선교 현장의 리얼 라이프 — 음식·언어·문화충격 생존기", capacity: 30 },
  { title: "어디까지 가봤니? 북한과 중국", lecturer: "박oo 선교사", location: "", description: "북한과 중국땅에 일하시는 하나님의 생생한 이야기", capacity: 30 },
  { title: "사회선교, 해봤니?", lecturer: "NGO 활동가", location: "", description: "사회선교에 관한 이야기", capacity: 30 },
  { title: "옆자리 외국인 동료에게 복음을?", lecturer: "다문화 사역자", location: "", description: "다문화 시대 한국 일터에서 만나는 무슬림·힌두·불교권 동료와의 대화법", capacity: 30 },
  { title: "내가 있는 곳이 선교지입니다", lecturer: "평신도 일터사역자", location: "", description: "거창하지 않아도 되는 일상 선교 — 직장·학교·동네에서 복음 흘리기", capacity: 30 },
  { title: "내 전공이 선교 도구가 된다면", lecturer: "BAM 실천자", location: "", description: "IT·의료·교육·디자인 — 전문성 기반 선교(BAM) 실제 사례와 로드맵", capacity: 30 },
  { title: "단기선교 A to Z", lecturer: "", location: "", description: "교회 내 단기선교 소개. 단기선교 과정. 단기선교의 이상과 현실.", capacity: 30 },

  // 트랙 3: Re:bond — 관계의 매듭을 다시 묶다
  { title: "나는 대화가 더 이상 두렵지 않다", lecturer: "상담사/교역자", location: "", description: "대화법 실습", capacity: 30 },
  { title: "소개팅 앱 vs 하나님의 타이밍", lecturer: "신혼부부 평신도", location: "", description: "필터 없는 크리스천 연애 리얼토크", capacity: 30 },
  { title: "왜 이런 집에 보내셨어요?", lecturer: "심리상담사", location: "", description: "원가정 회복", capacity: 30 },
  { title: "혼자여도 괜찮다는 거짓말", lecturer: "3040 리더", location: "", description: "싱글의 외로움·영성·건강한 관계 맺기 솔직 대화", capacity: 30 },
  { title: "교회가 나를 아프게 했을 때", lecturer: "교역자/상담사", location: "", description: "상처받고도 남아야 하는 이유, 혹은 떠나도 되는 이유", capacity: 30 },
  { title: "결혼은 현실이다", lecturer: "기혼 평신도", location: "", description: "믿음의 가정을 세우기 위한 전략", capacity: 30 },
  { title: "넌 크리스챤과 좋은 관계 맺기", lecturer: "교역자/청년리더", location: "", description: "직장과 캠퍼스, 가정의 넌 크리스챤과 좋은 관계 맺는 법", capacity: 30 },
  { title: "인스타 속 나는 행복한데 현실은…", lecturer: "상담사", location: "", description: "SNS 비교의식 해독 — 디지털 시대 자기정체성 회복", capacity: 30 },

  // 트랙 4: Life & Worldview — 세상이라는 전장의 무기들
  { title: "영끌한 내 통장, 하나님은 뭐라 하실까", lecturer: "재무설계사 평신도", location: "", description: "주식·코인·빚 — 성경적 재정 관리와 헌금의 원칙", capacity: 30 },
  { title: "월급 200만원으로 독립할 수 있을까", lecturer: "금융/부동산 종사자", location: "", description: "전월세·청약·재정 설계 — 청년 주거 독립 현실 가이드", capacity: 30 },
  { title: "AI가 설교도 하는 시대, 인간은 왜 필요한가", lecturer: "IT전문가 평신도", location: "", description: "인공지능 시대의 인간 존엄과 크리스천의 소명", capacity: 30 },
  { title: "목사님, 저 우울증인데 기도하면 낫나요?", lecturer: "정신과 전문의/임상심리사", location: "", description: "불안·공황·우울을 신앙과 의학 양쪽에서 마주하기", capacity: 30 },
  { title: "하나님이 만든 대중문화", lecturer: "교역자/평신도", location: "", description: "유튜브, 넷플릭스 등 대중문화를 기독교 세계관으로 읽고 나의 미디어 사역 시작하기", capacity: 30 },
  { title: "하나님 저는 어디로 가야할까요?", lecturer: "교역자/평신도 전문가", location: "", description: "크리스천의 진로 결정", capacity: 30 },
  { title: "죽음을 생각해본 적 있나요?", lecturer: "교역자/신학자", location: "", description: "영생과 종말 — 우리가 회피하는 가장 중요한 질문", capacity: 30 },
];

async function seed() {
  const col = db.collection("lectures");

  // 기존 강의 확인
  const existing = await col.get();
  if (!existing.empty) {
    console.log(`⚠️  이미 ${existing.size}개의 강의가 있습니다. 중복 방지를 위해 종료합니다.`);
    console.log("    기존 강의를 모두 삭제한 뒤 다시 실행하세요.");
    process.exit(0);
  }

  console.log(`📚 강의 ${lectures.length}개 등록 중...`);
  for (const lecture of lectures) {
    await col.add({ ...lecture, applicantIds: [], createdAt: Timestamp.now() });
    process.stdout.write(".");
  }
  console.log(`\n✅ 완료! 총 ${lectures.length}개 강의가 등록되었습니다.`);
}

seed().catch((e) => { console.error(e); process.exit(1); });
