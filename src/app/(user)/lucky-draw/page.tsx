"use client";

import { useState, useEffect } from "react";
import { Gift, ArrowLeft, Trophy, Users, Sparkles, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { subscribeLuckyDraws } from "@/lib/services/luckyDrawService";
import { LuckyDraw } from "@/types/database";

export default function LuckyDrawPage() {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeLuckyDraws((data) => {
      setDraws(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-24">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-2 -ml-2 hover:bg-toss-lightGray rounded-full transition-colors active:scale-90">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-[17px] font-bold text-toss-black">추첨</h1>
      </header>

      <main className="p-5 flex flex-col gap-6">
        <div className="bg-gradient-to-br from-toss-blue to-[#5d98f7] rounded-[32px] p-8 text-white shadow-lg shadow-toss-blue/20 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              <Gift size={28} />
              행운의 주인공은?
            </h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed">
              수련회 기간 중 깜짝 추첨이 진행됩니다.<br />
              발표되는 결과를 실시간으로 확인해보세요!
            </p>
          </div>
          <Sparkles className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 rotate-12" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-toss-blue" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {draws.map((draw) => (
              <div
                key={draw.id}
                className="bg-white dark:bg-surface rounded-[32px] p-6 shadow-sm border border-toss-border/40 overflow-hidden relative transition-all active:scale-[0.98]"
              >
                {draw.status === "drawing" && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-toss-blue animate-pulse"></div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-[17px] font-black text-toss-black leading-tight mb-1.5">{draw.title}</h2>
                    <p className="text-[11px] font-bold text-toss-gray uppercase tracking-wider">
                      총 {draw.winnerCount}명 당첨
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0",
                      draw.status === "completed"
                        ? "bg-toss-lightGray text-toss-gray"
                        : draw.status === "drawing"
                        ? "bg-toss-blue text-white animate-pulse"
                        : "bg-blue-50 text-toss-blue"
                    )}
                  >
                    {draw.status === "completed"
                      ? "추첨 완료"
                      : draw.status === "drawing"
                      ? "추첨 중..."
                      : "대기 중"}
                  </span>
                </div>

                {draw.status === "completed" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-toss-blue mb-1">
                      <Trophy size={14} className="text-yellow-500" />
                      <span>축하합니다! 당첨자</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {draw.winners.map((winner, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-yellow-50/50 border border-yellow-100/60 rounded-2xl animate-in zoom-in-95 duration-500"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-md border-2 border-white">
                              <Sparkles size={20} />
                            </div>
                            <div>
                              <p className="font-black text-[15px] text-toss-black">{winner.userName}</p>
                              <p className="text-[11px] text-toss-gray font-bold">
                                {winner.userTeam} · {winner.userGroup}조
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-center bg-white dark:bg-surface w-8 h-8 rounded-full shadow-sm border border-yellow-100">
                            <Check size={16} className="text-yellow-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : draw.status === "drawing" ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-5 bg-toss-lightGray/30 rounded-3xl border-2 border-dashed border-toss-border/40">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-toss-blue/10 border-t-toss-blue animate-spin"></div>
                      <Gift size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-toss-blue" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-black text-toss-black">두구두구... 추첨 진행 중!</p>
                      <p className="text-xs font-bold text-toss-gray mt-1 opacity-60">
                        결과가 곧 발표됩니다. 잠시만 기다려주세요.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center gap-4 bg-toss-lightGray/20 rounded-3xl border border-toss-border/20">
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-surface flex items-center justify-center text-toss-gray/20 shadow-inner">
                      <Users size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-[13px] font-bold text-toss-gray/50">아직 추첨 전입니다.</p>
                      <p className="text-[11px] font-medium text-toss-gray/30 mt-0.5">
                        운영진의 발표를 기다려주세요!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {draws.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-toss-lightGray rounded-full flex items-center justify-center mb-6">
                  <Gift size={40} className="text-toss-gray/20" />
                </div>
                <p className="text-base font-black text-toss-gray/40">진행 중인 추첨이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-surface rounded-[32px] p-8 border border-toss-border/40 mt-4">
          <h4 className="text-[14px] font-black text-toss-black mb-4 flex items-center gap-2">
            <Check size={18} className="text-toss-blue" />
            안내사항
          </h4>
          <ul className="space-y-3">
            {[
              "추첨은 수련회 일정 중 비정기적으로 진행됩니다.",
              "당첨되신 분들은 발표 후 안내에 따라 경품을 수령해주세요.",
              "본 화면을 유지하시면 실시간 결과를 가장 빨리 보실 수 있습니다.",
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed text-toss-gray font-medium">
                <span className="text-toss-blue shrink-0">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
