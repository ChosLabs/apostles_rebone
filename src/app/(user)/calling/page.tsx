"use client";

import { useState, useEffect } from "react";
import { Globe, Briefcase, Users, Mic2, Sparkles, CheckCircle2, Loader2, Coffee, ChevronDown, ChevronUp, Clock, Lock } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  subscribeCallingZoneConfig,
  subscribeUserStamps,
  addStamp,
} from "@/lib/services/callingZoneService";
import { CallingZoneConfig } from "@/types/database";

type Zone = {
  id: string;
  letter: string;
  name: string;
  theme: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  features: string[];
  quest: string;
};

const ZONES: Zone[] = [
  {
    id: "zone-a",
    letter: "A",
    name: "Mission & Global",
    theme: "땅끝을 향한 부르심",
    icon: <Globe size={22} />,
    color: "#F97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.25)",
    features: [
      "기아대책(KFH) · 월드비전 NGO 구호 사역 부스",
      "선교 현장 사진전",
      "다문화 체험 미니 코너",
    ],
    quest: "선교 돌림판 미션 완료 후 '인생네컷' 특별 촬영 (3존 이상 체험 완료자 한정)",
  },
  {
    id: "zone-b",
    letter: "B",
    name: "Life & Vocation",
    theme: "일상과 직업의 부르심",
    icon: <Briefcase size={22} />,
    color: "#3182f6",
    bg: "rgba(49,130,246,0.08)",
    border: "rgba(49,130,246,0.25)",
    features: [
      "선택강의 간사와의 팝업 코칭 테이블 (10분 1:1 상담)",
      "실천카드 50종 비치",
      "전문인 선교 네트워크(BAM) QR 가입",
    ],
    quest: "'실천카드' 1장을 골라 뒷면에 이번 주 실천할 한 가지를 작성 & 결단",
  },
  {
    id: "zone-c",
    letter: "C",
    name: "Community & Re:bond",
    theme: "관계와 연합의 부르심",
    icon: <Users size={22} />,
    color: "#16A34A",
    bg: "rgba(22,163,74,0.08)",
    border: "rgba(22,163,74,0.25)",
    features: [
      "1~6팀 · 임원단 · 초신/기신 부스 운영",
      "각 국 및 동아리 비전 소개 & 체험",
    ],
    quest: "'나누기(÷) 프로젝트' — 익명 편지 우체통에 격려 편지를 쓰면 저녁 메인 집회 전 배달",
  },
  {
    id: "zone-d",
    letter: "D",
    name: "Confession & Story",
    theme: "고백과 간증의 자리",
    icon: <Mic2 size={22} />,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.25)",
    features: [
      "'나는 오늘 이것을 결단합니다' 대형 포스트잇 보드",
      "손바닥 기도 벽면 (공동 기도제목)",
    ],
    quest: "120분간 주기적으로 진행되는 '5분 간증 오픈 마이크' 무대 (15:30 / 16:00)",
  },
  {
    id: "zone-e",
    letter: "E",
    name: "Prayer & Healing",
    theme: "내면의 부르심 (별도 세미나룸)",
    icon: <Sparkles size={22} />,
    color: "#B45309",
    bg: "rgba(180,83,9,0.08)",
    border: "rgba(180,83,9,0.25)",
    features: [
      "기도의 골방 — 교역자/멘토의 안수 및 심방 기도 상시 대기",
      "전문 상담 (정신건강, 가족관계 등)",
      "사후 연결 예약 데스크",
    ],
    quest: "조용한 환경에서 에베소서 4:22-24 말씀 묵상 & 개인 묵상",
  },
];

const ALL_ZONE_IDS = ZONES.map((z) => z.id);

const TIMELINE = [
  { time: "15:00", label: "공식 오픈", desc: "디렉터 선언 · 스탬프 규칙 안내 · LED 기도제목 실시간 송출" },
  { time: "15:10", label: "자유 탐험", desc: "5개 존 동시 순회 (70분) · 팝업 코칭 10분 순환 · 5분 간증 무대 (15:30 / 16:00)" },
  { time: "16:20", label: "조별 소그룹 나눔", desc: "각 조별 지정 구역 집결 · '무엇에 마음이 움직였는지' 즉석 나눔" },
  { time: "16:40", label: "클라이맥스", desc: "마지막 5분 간증 · 스탬프 굿즈 배부 · 결단 보드 최종 작성" },
  { time: "16:55", label: "Wrap-up", desc: "결단 보드 사진 촬영 · 저녁 식사 장소 안내 후 해산" },
];

export default function CallingPage() {
  const { user, isGuest } = useAuth();
  const [config, setConfig] = useState<CallingZoneConfig | null>(null);
  const [stamps, setStamps] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeCallingZoneConfig((cfg) => {
      setConfig(cfg);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeUserStamps(user.uid, setStamps);
  }, [user]);

  const handleStampClick = (zone: Zone) => {
    if (stamps.includes(zone.id)) return;
    if (isGuest) {
      alert("게스트 모드에서 제한된 기능입니다.");
      return;
    }
    setSelectedZone(zone);
    setCode("");
    setError(false);
  };

  const verifyCode = async () => {
    if (!selectedZone || !config || !user) return;
    const correctCode = config.booths[selectedZone.id]?.code ?? "";
    if (code !== correctCode) { setError(true); return; }
    try {
      setSaving(true);
      await addStamp(user.uid, user.name, user.team ?? "", selectedZone.id, ALL_ZONE_IDS, user.phone ? user.phone.replace(/-/g, "").slice(-4) : "");
      setSelectedZone(null);
    } catch {
      alert("스탬프 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-toss-blue" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-10 px-4">

      {/* ── 헤더 배너 ── */}
      <div className="bg-[#191f28] rounded-toss p-6 mt-2 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
        <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">DAY 2 · 6/6(토) 15:00~17:00</span>
        <h2 className="text-2xl font-black text-white mt-1 mb-1">
          Calling Zone<wbr /><span className="text-[#FF8A65]">(</span>Call To Action<span className="text-[#FF8A65]">)</span>
        </h2>
        <p className="text-xs text-white/60 leading-relaxed">평창 알펜시아 리조트 컨벤션센터 · 그랜드 볼룸 2층</p>
        <p className="text-sm text-white/80 mt-3 leading-relaxed">
          선택강의에서 받은 감동이 구체적인 삶의 헌신과 행동으로 연결되는 120분의 핵심 플랫폼
        </p>
      </div>

      {/* ── 타임라인 ── */}
      <div className="bg-white dark:bg-surface rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
        <h3 className="text-[11px] font-bold text-toss-gray uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <Clock size={13} /> 운영 타임라인
        </h3>
        <div className="flex flex-col gap-0">
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-toss-blue mt-1.5 shrink-0" />
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-toss-border/60 my-1" />}
              </div>
              <div className="pb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-black text-toss-blue">{item.time}</span>
                  <span className="text-[13px] font-bold text-toss-black">{item.label}</span>
                </div>
                <p className="text-[11px] text-toss-gray leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5 ZONES ── */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[11px] font-bold text-toss-gray uppercase tracking-wider px-1">5대 존 안내</h3>
        {ZONES.map((zone) => {
          const isExpanded = expandedZone === zone.id;
          const isStamped = stamps.includes(zone.id);
          return (
            <div
              key={zone.id}
              className="bg-white dark:bg-surface rounded-toss shadow-[0_2px_8px_rgba(0,0,0,0.04)] border overflow-hidden transition-all"
              style={{ borderColor: isExpanded ? zone.border : "rgba(0,0,0,0.06)" }}
            >
              {/* 존 헤더 */}
              <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg"
                  style={{ backgroundColor: zone.bg, color: zone.color }}
                >
                  {zone.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-black text-toss-black">{zone.name}</span>
                    {isStamped && (
                      <span className="text-[9px] font-bold text-toss-blue bg-toss-blue/10 px-1.5 py-0.5 rounded-full">완료</span>
                    )}
                  </div>
                  <p className="text-[11px] text-toss-gray truncate">{zone.theme}</p>
                </div>
                <div className="text-toss-gray/40 shrink-0">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* 존 상세 */}
              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div
                    className="h-px w-full"
                    style={{ backgroundColor: zone.border }}
                  />
                  {/* 아이콘 + 테마 */}
                  <div className="flex items-center gap-2" style={{ color: zone.color }}>
                    {zone.icon}
                    <span className="text-sm font-bold">{zone.theme}</span>
                  </div>
                  {/* Key Features */}
                  <div>
                    <p className="text-[10px] font-bold text-toss-gray uppercase tracking-wider mb-1.5">Key Features</p>
                    <ul className="flex flex-col gap-1">
                      {zone.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-toss-black leading-snug">
                          <span className="mt-0.5 shrink-0 text-toss-gray/40">·</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Key Quest */}
                  <div
                    className="rounded-xl p-3"
                    style={{ backgroundColor: zone.bg }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: zone.color }}>Key Quest</p>
                    <p className="text-[12px] text-toss-black leading-snug">{zone.quest}</p>
                  </div>
                  {/* 스탬프 버튼 */}
                  <button
                    onClick={() => handleStampClick(zone)}
                    disabled={isStamped}
                    className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    style={
                      isStamped
                        ? { backgroundColor: zone.bg, color: zone.color }
                        : isGuest
                        ? { backgroundColor: "rgb(242 244 246)", color: "rgb(78 89 104)" }
                        : { backgroundColor: zone.color, color: "white" }
                    }
                  >
                    {isGuest && !isStamped && <Lock size={13} />}
                    {isStamped ? "✓ 스탬프 완료" : isGuest ? "게스트 모드에서 제한된 기능입니다" : "스탬프 인증하기"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Calling Cafe ── */}
      <div className="bg-white dark:bg-surface rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
          <Coffee size={20} />
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-toss-black mb-0.5">Calling Cafe <span className="text-[11px] font-normal text-toss-gray">(복음 Cafe)</span></h4>
          <p className="text-[12px] text-toss-gray leading-relaxed">
            수련회 기간 중 가장 질 좋은 간식과 커피를 <span className="font-bold text-toss-black">콜링존 내에서만</span> 제공합니다. 자연스러운 대화 공간으로 이용하세요.
          </p>
        </div>
      </div>

      {/* ── Calling Passport (스탬프) ── */}
      <div className="bg-white dark:bg-surface rounded-toss p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-toss-border/40">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-bold text-toss-gray uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-toss-blue" />
            Calling Passport
          </h3>
          {isGuest ? (
            <span className="text-[10px] font-bold text-toss-gray bg-toss-lightGray px-2 py-1 rounded-md flex items-center gap-1">
              <Lock size={9} />
              게스트 모드
            </span>
          ) : (
            <span className="text-[10px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-1 rounded-md">
              {stamps.length} / 5 완료
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {ZONES.map((zone) => {
            const isCompleted = stamps.includes(zone.id);
            return (
              <button
                key={zone.id}
                onClick={() => handleStampClick(zone)}
                disabled={isCompleted}
                className={clsx(
                  "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
                  !isCompleted && "bg-black/[0.02] dark:bg-white/[0.05] border-dashed border-black/10 dark:border-white/20"
                )}
                style={isCompleted ? { backgroundColor: zone.bg, borderColor: zone.color, borderStyle: "solid" } : undefined}
              >
                <span
                  className={clsx("text-sm font-black", !isCompleted && "text-black/20 dark:text-white/30")}
                  style={isCompleted ? { color: zone.color } : undefined}
                >
                  {isCompleted ? "✓" : zone.letter}
                </span>
                <span
                  className={clsx("text-[8px] font-bold leading-none", !isCompleted && "text-black/20 dark:text-white/30")}
                  style={isCompleted ? { color: zone.color } : undefined}
                >
                  ZONE {zone.letter}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-center mt-3 leading-relaxed">
          {stamps.length >= 5 ? (
            <span className="text-toss-blue font-bold">전체 스탬프 완료! RE:본 텀블러 굿즈를 받으세요 🎉</span>
          ) : stamps.length >= 3 ? (
            <span className="text-toss-gray">3존 이상 완료 → <span className="font-bold text-toss-black">인생네컷</span> 특별 촬영 참여 가능!</span>
          ) : (
            <span className="text-toss-gray">5곳 모두 완료 시 <span className="text-toss-black font-bold">RE:본 텀블러</span> 한정 굿즈 증정</span>
          )}
        </p>
      </div>

      {/* ── 스탬프 인증 모달 ── */}
      {selectedZone && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedZone(null)}
        >
          <div
            className="bg-white dark:bg-surface w-full max-w-[320px] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl font-black"
                style={{ backgroundColor: selectedZone.bg, color: selectedZone.color }}
              >
                {selectedZone.letter}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: selectedZone.color }}>
                ZONE {selectedZone.letter}
              </p>
              <h2 className="text-lg font-bold text-toss-black mb-1">{selectedZone.name}</h2>
              <p className="text-sm text-toss-gray mb-5">부스에 비치된 4자리 코드를 입력해주세요</p>

              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(false); }}
                maxLength={4}
                placeholder="0000"
                autoFocus
                className={`w-full bg-toss-lightGray text-toss-black border-2 rounded-xl py-4 text-center text-2xl font-black tracking-[12px] focus:outline-none transition-colors ${
                  error ? "border-red-400 !text-red-500" : "border-transparent focus:border-toss-blue"
                }`}
              />
              {error && <p className="text-xs text-red-500 mt-2 font-bold">코드가 일치하지 않습니다</p>}

              <div className="flex gap-2 w-full mt-5">
                <button
                  onClick={() => setSelectedZone(null)}
                  className="flex-1 bg-toss-lightGray text-toss-gray font-bold py-4 rounded-xl active:scale-95 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={verifyCode}
                  disabled={saving}
                  className="flex-[2] text-white font-bold py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ backgroundColor: selectedZone.color }}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  인증
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
