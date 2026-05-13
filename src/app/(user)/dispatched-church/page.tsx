"use client";

import { useState, useEffect } from "react";
import {
  Clock, ArrowLeft, Loader2, Bus, MapPin, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeDispatchedChurches } from "@/lib/services/dispatchedChurchService";
import { DispatchedChurch } from "@/types/database";

export default function DispatchedChurchPage() {
  const { user } = useAuth();
  const userGroup = user?.group;

  const [churches, setChurches] = useState<DispatchedChurch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeDispatchedChurches((data) => {
      const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setChurches(sorted);
      setLoading(false);
    });
    return unsub;
  }, []);

  const myChurch = userGroup
    ? churches.find((c) => c.assignedGroups.includes(userGroup))
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">아웃리치</h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center flex-1 py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <main className="p-4 flex flex-col gap-4">
          {/* 나의 파송교회 */}
          {myChurch ? (
            <MyChurchCard church={myChurch} userGroup={userGroup!} />
          ) : (
            <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
              {userGroup
                ? "배정된 파송교회가 없습니다. 관리자에게 문의해주세요."
                : "조 배정이 필요합니다. 관리자에게 문의해주세요."}
            </div>
          )}

          {/* 전체 목록 */}
          <div className="px-1 mt-2">
            <h2 className="text-[15px] font-bold text-toss-black mb-1">전체 파송교회</h2>
            <p className="text-xs text-toss-gray mb-3">총 {churches.length}개 교회</p>
          </div>

          {churches.length === 0 ? (
            <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
              등록된 파송교회가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {churches.map((church) => (
                <ChurchCard
                  key={church.id}
                  church={church}
                  isMine={myChurch?.id === church.id}
                  userGroup={userGroup}
                  expanded={expandedId === church.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === church.id ? null : church.id))
                  }
                />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

function MyChurchCard({ church, userGroup }: { church: DispatchedChurch; userGroup: number }) {
  return (
    <section className="bg-white dark:bg-surface rounded-toss shadow-sm border border-toss-blue/20 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-toss-blue/5 border-b border-toss-blue/10 px-5 pt-5 pb-4">
        <span className="text-[10px] font-bold bg-toss-blue text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
          My Assignment
        </span>
        <h3 className="text-2xl font-black text-toss-black mt-2">{church.name}</h3>
        <p className="text-sm text-toss-blue font-bold mt-0.5">{userGroup}조 파송</p>

        {/* 출발 정보 */}
        {(church.departureTime || church.travelTime) && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {church.departureTime && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-toss-blue/20 text-toss-blue px-3 py-1.5 rounded-full">
                <Clock size={12} />
                출발 {church.departureTime}
              </span>
            )}
            {church.travelTime && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-toss-border/40 text-toss-gray px-3 py-1.5 rounded-full">
                <Bus size={12} />
                이동 {church.travelTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 일정 타임라인 */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-3">일정</p>
        <Timeline items={church.schedule} />
      </div>

      {/* 사역 내용 */}
      {church.ministries.length > 0 && (
        <div className="px-5 pb-4 border-t border-toss-border/40 pt-4">
          <p className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-2">사역 내용</p>
          <div className="flex flex-wrap gap-1.5">
            {church.ministries.map((m, i) => (
              <span key={i} className="text-xs font-medium bg-toss-blue/8 text-toss-blue px-2.5 py-1 rounded-lg border border-toss-blue/10">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 특이사항 */}
      {church.note && (
        <div className="mx-5 mb-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-2">
          <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">{church.note}</p>
        </div>
      )}
    </section>
  );
}

function ChurchCard({
  church, isMine, userGroup, expanded, onToggle,
}: {
  church: DispatchedChurch;
  isMine: boolean;
  userGroup?: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-surface rounded-toss shadow-sm border transition-all overflow-hidden",
        isMine ? "border-toss-blue/30" : "border-toss-border/40"
      )}
    >
      {/* 요약 행 (항상 표시) */}
      <button
        className="w-full px-4 py-4 flex items-center gap-3 text-left"
        onClick={onToggle}
      >
        {/* 번호 */}
        <span className="w-7 h-7 rounded-full bg-toss-lightGray text-toss-gray text-[11px] font-black flex items-center justify-center shrink-0">
          {church.order}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[15px] font-bold text-toss-black">{church.name}</span>
            {isMine && (
              <span className="text-[10px] font-bold bg-toss-blue text-white px-1.5 py-0.5 rounded-full">
                내 파송
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {church.departureTime && (
              <span className="text-[11px] text-toss-gray flex items-center gap-1">
                <Clock size={10} />{church.departureTime} 출발
              </span>
            )}
            {church.schedule[0] && (
              <span className="text-[11px] text-toss-gray">
                {church.schedule[0].time} {church.schedule[0].description}
              </span>
            )}
          </div>
        </div>

        {/* 배정 조 */}
        <div className="flex gap-1 flex-wrap justify-end shrink-0 max-w-[90px]">
          {church.assignedGroups.map((g) => (
            <span
              key={g}
              className={clsx(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                g === userGroup
                  ? "bg-toss-blue text-white"
                  : "bg-toss-lightGray text-toss-gray"
              )}
            >
              {g}조
            </span>
          ))}
        </div>

        {expanded ? (
          <ChevronUp size={16} className="text-toss-border shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-toss-border shrink-0" />
        )}
      </button>

      {/* 확장 내용 */}
      {expanded && (
        <div className="border-t border-toss-border/40 px-4 pb-4 pt-3 space-y-4">
          {/* 이동 정보 */}
          {church.travelTime && (
            <div className="flex items-center gap-1.5 text-xs text-toss-gray font-medium">
              <Bus size={13} className="text-toss-blue" />
              이동 시간 {church.travelTime}
            </div>
          )}

          {/* 일정 */}
          <div>
            <p className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-2">일정</p>
            <Timeline items={church.schedule} compact />
          </div>

          {/* 사역 */}
          {church.ministries.length > 0 && (
            <div>
              <p className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-1.5">사역 내용</p>
              <ul className="space-y-1">
                {church.ministries.map((m, i) => (
                  <li key={i} className="text-xs text-toss-black leading-relaxed flex gap-1.5">
                    <span className="text-toss-blue mt-0.5">·</span>{m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 특이사항 */}
          {church.note && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex gap-2">
              <Info size={12} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">{church.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({
  items, compact = false,
}: {
  items: DispatchedChurch["schedule"];
  compact?: boolean;
}) {
  return (
    <div className="relative">
      {/* 세로 선 */}
      <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-toss-border/50 rounded-full" />

      <div className={clsx("flex flex-col", compact ? "gap-2.5" : "gap-3.5")}>
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start relative">
            <span className="w-4 h-4 rounded-full bg-white border-2 border-toss-blue shrink-0 mt-0.5 relative z-10" />
            <div className="flex-1 min-w-0">
              <span className={clsx(
                "font-bold text-toss-blue",
                compact ? "text-[11px]" : "text-xs"
              )}>
                {item.time}
              </span>
              <p className={clsx(
                "text-toss-black leading-snug",
                compact ? "text-[12px]" : "text-sm"
              )}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
