import { ScheduleItem } from "@/types/database";

export interface ChurchSeed {
  order: number;
  name: string;
  departureTime: string;
  travelTime: string;
  assignedGroups: number[];
  schedule: ScheduleItem[];
  ministries: string[];
  note?: string;
}

export const CHURCH_SEED_DATA: ChurchSeed[] = [
  {
    order: 1,
    name: "푸른솔교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배" },
      { time: "14:00", description: "오후 예배 (설교 15분)" },
      { time: "14:15", description: "교제 시간 (성도 교제, 레크리에이션)" },
      { time: "15:20", description: "사역 마감" },
    ],
    ministries: ["어르신 맞춤형 찬송가 찬양 콘티", "성도 교제 및 레크리에이션"],
  },
  {
    order: 2,
    name: "청송읍교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00~12:00", description: "오전 예배" },
      { time: "12:00~14:00", description: "점심 식사 및 교제" },
      { time: "14:00~14:20", description: "오후 예배" },
      { time: "14:20~", description: "전도 사역 시작" },
    ],
    ministries: ["전도 (전도용품 150~200개)"],
  },
  {
    order: 3,
    name: "중평평화교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "10:30~11:30", description: "오전 예배" },
      { time: "13:00~13:30", description: "오후 예배 (찬양 인도 10분)" },
    ],
    ministries: ["교회 주변 및 창틀 청소 (청소 도구 지참)", "본당 주변 폐자재 정리"],
    note: "준비물: 피아노, 마이크 4개, 자막 PPT, 노트북, HDMI 케이블",
  },
  {
    order: 4,
    name: "성지교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배" },
      { time: "12:00", description: "점심 식사" },
      { time: "13:30~15:20", description: "사역 진행" },
    ],
    ministries: ["화재 관련 주민 위로", "찬양 인도 및 레크리에이션"],
    note: "일회용 그릇을 청송교회로 사전 발송 후 수령 필요",
  },
  {
    order: 5,
    name: "송생교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00~11:40", description: "오전 예배 (오후 예배 없음)" },
      { time: "예배 후", description: "교제 및 레크리에이션" },
    ],
    ministries: ["경로당 방문 전도 (전도 키트 70개)", "반주기 활용 및 가사 인쇄물 준비"],
    note: "찬양 요청: 누군가 널 위해 기도하네, 손을 높이 들고, 달리다굼, 실로암",
  },
  {
    order: 6,
    name: "부남교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00~12:30", description: "오전 예배 및 초청 잔치 (복음 전도 프로그램 30분 포함)" },
      { time: "14:00~14:40", description: "오후 예배 및 마침" },
    ],
    ministries: ["1:1 매칭 프로그램", "복음 제시 프로그램"],
  },
  {
    order: 7,
    name: "부남중앙교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배" },
      { time: "12:00", description: "점심 식사" },
      { time: "13:30", description: "오후 찬양 예배 (찬양 30분)" },
      { time: "14:30", description: "모든 일정 종료" },
    ],
    ministries: ["단색(흰색) 페인트 작업 보조"],
  },
  {
    order: 8,
    name: "화정교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "10:35", description: "오전 찬양 인도" },
      { time: "11:00", description: "말씀 선포 (25분)" },
      { time: "11:50", description: "예배 마감 및 식사" },
      { time: "13:00~15:00", description: "전도 사역 (전도용품 50개)" },
      { time: "15:10", description: "출발" },
    ],
    ministries: ["전도 사역", "경로당 할머니 1:1 경청 및 말벗 사역"],
    note: "찬양 요청: 나의 갈 길 다 가도록, 내 주를 가까이, 난 예수가 좋다오, 세상에서 방황할 때",
  },
  {
    order: 9,
    name: "중기교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배 (오후 예배 없음)" },
      { time: "식사 후", description: "복음 전도 사역 시작 (120가구 방문, 전도용품 100개)" },
      { time: "15:00", description: "동신교회로 이동 (중기교회 복귀 불필요)" },
    ],
    ministries: ["가가호호 복음 전도 (120가구, 전도용품 100개)"],
  },
  {
    order: 10,
    name: "행복한교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00~12:00", description: "오전 예배" },
      { time: "12:00~13:30", description: "점심 식사" },
      { time: "13:30~15:00", description: "냇가 청소 및 어르신 말벗 사역" },
      { time: "15:00", description: "출발" },
    ],
    ministries: ["냇가 청소 (집게·비닐봉지·장화 필요)", "어르신 말벗 사역"],
  },
  {
    order: 11,
    name: "영동교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배" },
      { time: "13:30~14:30", description: "오후 예배 및 찬양 인도" },
    ],
    ministries: ["꽃밭 조성 청소, 잡초 제거, 쓰레기 수거 (목장갑 필요)"],
  },
  {
    order: 12,
    name: "청송교회",
    departureTime: "",
    travelTime: "",
    assignedGroups: [],
    schedule: [
      { time: "11:00", description: "오전 예배" },
      { time: "13:30~15:00", description: "청소년 찬양집회 및 행운권 추첨" },
    ],
    ministries: ["청소년 찬양집회", "성도와의 교제"],
    note: "순두부 일괄 배송 수령처 (교회별 15kg)",
  },
];
