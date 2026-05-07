"use client";

import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { ChevronRight, ChevronLeft, RotateCcw, Sparkles } from "lucide-react";
import { Lecture, LectureType } from "@/types/database";

// ─── Types ──────────────────────────────────────────────────────────────────

type Topic = "신앙기초" | "선교봉사" | "관계공동체" | "현실생활" | "세계관사고" | "치유회복";
type Situation = "대학생취준생" | "직장인" | "싱글" | "기혼예비부부" | "상관없음";

// ─── Step option data ────────────────────────────────────────────────────────

const TOPICS: { id: Topic; emoji: string; label: string; sub: string }[] = [
  { id: "신앙기초",   emoji: "✝️", label: "신앙 기초",   sub: "기도, 말씀, 예배" },
  { id: "선교봉사",   emoji: "🌍", label: "선교·봉사",   sub: "선교 현장, 일상 선교" },
  { id: "관계공동체", emoji: "💛", label: "관계·공동체", sub: "연애, 가정, 소통" },
  { id: "현실생활",   emoji: "💼", label: "현실 생활",   sub: "재정, 진로, 멘탈" },
  { id: "세계관사고", emoji: "🧠", label: "세계관·사고", sub: "AI, 이단, 변증" },
  { id: "치유회복",   emoji: "🩹", label: "치유·회복",   sub: "상처, 우울, 정체성" },
];

const TYPES: { id: LectureType; emoji: string; sub: string }[] = [
  { id: "이론형", emoji: "📖", sub: "지식과 원리를 배우고 싶다" },
  { id: "실천형", emoji: "🔨", sub: "바로 적용할 실전 도구가 필요하다" },
  { id: "나눔형", emoji: "💬", sub: "서로 이야기하며 깨닫고 싶다" },
  { id: "상담형", emoji: "🫂", sub: "전문가의 도움이 필요하다" },
];

const SITUATIONS: { id: Situation; emoji: string; label: string; sub: string }[] = [
  { id: "대학생취준생", emoji: "🎓", label: "대학생·취준생",  sub: "진로, 학업, 캠퍼스" },
  { id: "직장인",       emoji: "💻", label: "직장인",          sub: "일터, 커리어, 재정" },
  { id: "싱글",         emoji: "🙋", label: "싱글",            sub: "연애, 외로움, 독립" },
  { id: "기혼예비부부", emoji: "💍", label: "기혼·예비부부",  sub: "결혼, 가정, 육아" },
  { id: "상관없음",     emoji: "🌟", label: "상관없음",        sub: "어떤 상황이든 괜찮다" },
];

// ─── Lecture metadata for scoring ───────────────────────────────────────────

const LECTURE_META: Record<string, { topics: Topic[]; situations: Situation[]; track: string }> = {
  "출근길 5분의 기적":                           { topics: ["신앙기초"],               situations: ["직장인"],                        track: "Re:本" },
  "기도가 안 되는 밤에":                         { topics: ["신앙기초", "치유회복"],    situations: ["상관없음"],                      track: "Re:本" },
  "그 사람, 신천지입니다":                       { topics: ["세계관사고"],              situations: ["상관없음"],                      track: "Re:本" },
  "오늘의 운세, 오늘의 말씀":                    { topics: ["세계관사고"],              situations: ["상관없음"],                      track: "Re:本" },
  "성경이 넷플릭스보다 재밌어지는 법":           { topics: ["신앙기초"],               situations: ["상관없음"],                      track: "Re:本" },
  "ChatGPT에게 성경을 물었더니":                 { topics: ["세계관사고", "신앙기초"],  situations: ["상관없음"],                      track: "Re:本" },
  "솔직히, 예배가 지루합니다":                   { topics: ["신앙기초"],               situations: ["상관없음"],                      track: "Re:本" },
  "선교사님, 거기서 뭐 드세요?":                 { topics: ["선교봉사"],               situations: ["상관없음"],                      track: "Re:born" },
  "어디까지 가봤니? 북한과 중국":                { topics: ["선교봉사"],               situations: ["상관없음"],                      track: "Re:born" },
  "사회선교, 해봤니?":                           { topics: ["선교봉사"],               situations: ["상관없음"],                      track: "Re:born" },
  "옆자리 외국인 동료에게 복음을?":              { topics: ["선교봉사"],               situations: ["직장인"],                        track: "Re:born" },
  "내가 있는 곳이 선교지입니다":                 { topics: ["선교봉사"],               situations: ["직장인", "대학생취준생"],         track: "Re:born" },
  "내 전공이 선교 도구가 된다면":                { topics: ["선교봉사"],               situations: ["직장인", "대학생취준생"],         track: "Re:born" },
  "단기선교 A to Z":                             { topics: ["선교봉사"],               situations: ["대학생취준생", "상관없음"],       track: "Re:born" },
  "나는 대화가 더 이상 두렵지 않다":             { topics: ["관계공동체"],             situations: ["상관없음"],                      track: "Re:bond" },
  "소개팅 앱 vs 하나님의 타이밍":               { topics: ["관계공동체"],             situations: ["싱글"],                          track: "Re:bond" },
  "왜 이런 집에 보내셨어요?":                    { topics: ["관계공동체", "치유회복"],  situations: ["상관없음"],                      track: "Re:bond" },
  "혼자여도 괜찮다는 거짓말":                    { topics: ["관계공동체", "치유회복"],  situations: ["싱글"],                          track: "Re:bond" },
  "교회가 나를 아프게 했을 때":                  { topics: ["관계공동체", "치유회복"],  situations: ["상관없음"],                      track: "Re:bond" },
  "결혼은 현실이다":                             { topics: ["관계공동체"],             situations: ["기혼예비부부", "싱글"],           track: "Re:bond" },
  "넌 크리스챤과 좋은 관계 맺기":               { topics: ["관계공동체"],             situations: ["직장인", "대학생취준생"],         track: "Re:bond" },
  "인스타 속 나는 행복한데 현실은…":             { topics: ["관계공동체", "치유회복"],  situations: ["대학생취준생", "싱글"],           track: "Re:bond" },
  "영끌한 내 통장, 하나님은 뭐라 하실까":       { topics: ["현실생활"],               situations: ["직장인"],                        track: "Life&View" },
  "월급 200만원으로 독립할 수 있을까":           { topics: ["현실생활"],               situations: ["직장인", "대학생취준생"],         track: "Life&View" },
  "AI가 설교도 하는 시대, 인간은 왜 필요한가":  { topics: ["세계관사고"],             situations: ["직장인", "대학생취준생"],         track: "Life&View" },
  "목사님, 저 우울증인데 기도하면 낫나요?":      { topics: ["치유회복"],               situations: ["상관없음"],                      track: "Life&View" },
  "하나님이 만든 대중문화":                      { topics: ["세계관사고"],             situations: ["상관없음"],                      track: "Life&View" },
  "하나님 저는 어디로 가야할까요?":              { topics: ["현실생활"],               situations: ["대학생취준생"],                  track: "Life&View" },
  "죽음을 생각해본 적 있나요?":                  { topics: ["세계관사고"],             situations: ["상관없음"],                      track: "Life&View" },
};

// ─── Scoring ─────────────────────────────────────────────────────────────────
// topic: 50pt  |  type: 30pt  |  situation: 20pt

function scoreLecture(
  lecture: Lecture,
  selectedTopics: Topic[],
  selectedTypes: LectureType[],
  selectedSituation: Situation
): number {
  const meta = LECTURE_META[lecture.title];
  if (!meta || selectedTopics.length === 0) return 0;

  const topicMatch = selectedTopics.filter((t) => meta.topics.includes(t)).length;
  const topicScore = topicMatch / selectedTopics.length;

  const typeScore = lecture.lectureType && selectedTypes.includes(lecture.lectureType) ? 1 : 0;

  const situationScore =
    selectedSituation === "상관없음" ||
    meta.situations.includes(selectedSituation) ||
    meta.situations.includes("상관없음")
      ? 1 : 0;

  return Math.round((topicScore * 50 + typeScore * 30 + situationScore * 20));
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const LECTURE_TYPE_STYLE: Record<LectureType, string> = {
  실천형: "bg-green-50 text-green-600",
  나눔형: "bg-purple-50 text-purple-600",
  이론형: "bg-blue-50 text-toss-blue",
  상담형: "bg-orange-50 text-orange-500",
};

const TRACK_STYLE: Record<string, string> = {
  "Re:本":     "bg-blue-50 text-toss-blue",
  "Re:born":   "bg-orange-50 text-orange-500",
  "Re:bond":   "bg-purple-50 text-purple-600",
  "Life&View": "bg-green-50 text-green-600",
};

function scoreColor(s: number) {
  if (s >= 80) return "text-green-500";
  if (s >= 50) return "text-toss-blue";
  if (s >= 30) return "text-yellow-500";
  return "text-toss-gray";
}

function scoreBarColor(s: number) {
  if (s >= 80) return "bg-green-500";
  if (s >= 50) return "bg-toss-blue";
  if (s >= 30) return "bg-yellow-400";
  return "bg-toss-gray/40";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({
  step, total, onBack,
}: { step: number; total: number; onBack?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="p-1 -ml-1 text-toss-gray">
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                i < step ? "w-6 bg-toss-blue" : "w-3 bg-toss-lightGray"
              )}
            />
          ))}
        </div>
      </div>
      <span className="text-[11px] font-black text-toss-gray tracking-wider">
        STEP {step} / {total}
      </span>
    </div>
  );
}

function OptionRow({
  emoji, label, sub, selected, onClick,
}: { emoji: string; label: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-4 w-full p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98]",
        selected
          ? "border-toss-blue bg-toss-blue/5"
          : "border-toss-border bg-white hover:border-toss-blue/30"
      )}
    >
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-black text-toss-black">{label}</p>
        <p className="text-xs text-toss-gray mt-0.5">{sub}</p>
      </div>
      <div
        className={clsx(
          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
          selected ? "border-toss-blue bg-toss-blue" : "border-toss-border"
        )}
      >
        {selected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | "result";

export function LectureRecommender({ lectures }: { lectures: Lecture[] }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTopics, setSelectedTopics]       = useState<Topic[]>([]);
  const [selectedTypes, setSelectedTypes]         = useState<LectureType[]>([]);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  const results = useMemo(() => {
    if (step !== "result" || !selectedSituation) return [];
    return lectures
      .map((l) => ({ lecture: l, score: scoreLecture(l, selectedTopics, selectedTypes, selectedSituation) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [step, lectures, selectedTopics, selectedTypes, selectedSituation]);

  const reset = () => {
    setStep(1);
    setSelectedTopics([]);
    setSelectedTypes([]);
    setSelectedSituation(null);
  };

  const toggleTopic = (t: Topic) =>
    setSelectedTopics((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  const toggleType = (t: LectureType) =>
    setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]);

  // ── Step 1: topics ──────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col gap-5">
        <StepHeader step={1} total={3} />
        <div>
          <h2 className="text-xl font-black text-toss-black leading-snug">
            어떤 이야기가<br />궁금하세요?
          </h2>
          <p className="text-sm text-toss-gray mt-1">관심 가는 주제를 골라주세요 (복수 선택)</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              className={clsx(
                "flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.97]",
                selectedTopics.includes(t.id)
                  ? "border-toss-blue bg-toss-blue/5"
                  : "border-toss-border bg-white hover:border-toss-blue/30"
              )}
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-[13px] font-black text-toss-black leading-snug">{t.label}</span>
              <span className="text-[11px] text-toss-gray leading-tight">{t.sub}</span>
            </button>
          ))}
        </div>
        <NextButton disabled={selectedTopics.length === 0} onClick={() => setStep(2)} />
      </div>
    );
  }

  // ── Step 2: types ───────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="flex flex-col gap-5">
        <StepHeader step={2} total={3} onBack={() => setStep(1)} />
        <div>
          <h2 className="text-xl font-black text-toss-black leading-snug">
            어떤 방식이<br />좋으세요?
          </h2>
          <p className="text-sm text-toss-gray mt-1">선호하는 강의 스타일을 골라주세요 (복수 선택)</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {TYPES.map((t) => (
            <OptionRow
              key={t.id}
              emoji={t.emoji}
              label={t.id}
              sub={t.sub}
              selected={selectedTypes.includes(t.id)}
              onClick={() => toggleType(t.id)}
            />
          ))}
        </div>
        <NextButton disabled={selectedTypes.length === 0} onClick={() => setStep(3)} />
      </div>
    );
  }

  // ── Step 3: situation ───────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="flex flex-col gap-5">
        <StepHeader step={3} total={3} onBack={() => setStep(2)} />
        <div>
          <h2 className="text-xl font-black text-toss-black leading-snug">
            지금 나의<br />상황은?
          </h2>
          <p className="text-sm text-toss-gray mt-1">해당되는 것을 하나만 골라주세요</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {SITUATIONS.map((s) => (
            <OptionRow
              key={s.id}
              emoji={s.emoji}
              label={s.label}
              sub={s.sub}
              selected={selectedSituation === s.id}
              onClick={() => setSelectedSituation(s.id)}
            />
          ))}
        </div>
        <button
          onClick={() => setStep("result")}
          disabled={!selectedSituation}
          className="w-full py-4 rounded-2xl bg-toss-blue text-white font-black text-base disabled:opacity-30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-toss-blue/20"
        >
          <Sparkles size={18} />
          추천 받기
        </button>
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-toss-blue" />
            <span className="text-xs font-black text-toss-blue uppercase tracking-wider">맞춤 추천 결과</span>
          </div>
          <h2 className="text-xl font-black text-toss-black">
            {results.length > 0
              ? `추천 강의 TOP ${results.length}`
              : "조건에 맞는 강의가 없어요"}
          </h2>
          <p className="text-xs text-toss-gray mt-0.5">
            29개 중 {results.length}개를 추렸습니다
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-toss-lightGray text-toss-gray font-bold text-xs shrink-0"
        >
          <RotateCcw size={13} />
          다시 하기
        </button>
      </div>

      {/* Filter summary */}
      <div className="flex flex-wrap gap-1.5">
        {selectedTopics.map((t) => {
          const info = TOPICS.find((x) => x.id === t)!;
          return (
            <span key={t} className="text-[11px] font-bold bg-toss-blue/10 text-toss-blue px-2 py-0.5 rounded-full">
              {info.emoji} {info.label}
            </span>
          );
        })}
        {selectedTypes.map((t) => (
          <span key={t} className="text-[11px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
            #{t}
          </span>
        ))}
        {selectedSituation && selectedSituation !== "상관없음" && (() => {
          const s = SITUATIONS.find((x) => x.id === selectedSituation)!;
          return (
            <span className="text-[11px] font-bold bg-toss-lightGray text-toss-gray px-2 py-0.5 rounded-full">
              {s.emoji} {s.label}
            </span>
          );
        })()}
      </div>

      {/* Lecture cards */}
      {results.length === 0 ? (
        <div className="py-16 text-center text-toss-gray">
          <p className="text-sm font-bold mb-2">조건을 다시 선택해보세요</p>
          <button onClick={reset} className="text-toss-blue text-sm font-bold underline">
            처음부터 다시 하기
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map(({ lecture, score }, idx) => {
            const meta = LECTURE_META[lecture.title];
            const isTop = idx === 0;
            return (
              <div
                key={lecture.id}
                className={clsx(
                  "bg-white rounded-2xl border p-4 shadow-sm",
                  isTop ? "border-toss-blue/40 ring-1 ring-toss-blue/20" : "border-toss-border/40"
                )}
              >
                {isTop && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[11px] font-black text-toss-blue bg-toss-blue/10 px-2 py-0.5 rounded-full">
                      ✨ 가장 잘 맞는 강의
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                      {meta && (
                        <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", TRACK_STYLE[meta.track] ?? "bg-toss-lightGray text-toss-gray")}>
                          {meta.track}
                        </span>
                      )}
                      {lecture.lectureType && (
                        <span className={clsx("text-[10px] font-black px-1.5 py-0.5 rounded", LECTURE_TYPE_STYLE[lecture.lectureType])}>
                          #{lecture.lectureType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-black text-toss-black leading-snug mb-1">
                      {lecture.title}
                    </h3>
                    <p className="text-xs text-toss-gray leading-relaxed line-clamp-2">
                      {lecture.description}
                    </p>
                  </div>
                  {/* Score */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5 min-w-[44px]">
                    <span className={clsx("text-3xl font-black leading-none tabular-nums", scoreColor(score))}>
                      {score}
                    </span>
                    <span className="text-[9px] font-bold text-toss-gray mt-0.5 whitespace-nowrap">
                      적합도
                    </span>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mt-3 h-1.5 w-full bg-toss-lightGray rounded-full overflow-hidden">
                  <div
                    className={clsx("h-full rounded-full transition-all duration-700", scoreBarColor(score))}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function NextButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl bg-toss-blue text-white font-black text-base disabled:opacity-30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-toss-blue/20"
    >
      다음 <ChevronRight size={18} />
    </button>
  );
}
