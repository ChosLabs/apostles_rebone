"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Info, ArrowLeft, Loader2 } from "lucide-react";
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

  useEffect(() => {
    const unsub = subscribeDispatchedChurches((data) => {
      setChurches(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const myAssignedChurch = userGroup
    ? churches.find((c) => c.assignedGroups.includes(userGroup))
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">아웃리치 확인</h1>
      </header>

      {loading ? (
        <div className="flex justify-center items-center flex-1 py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <main className="p-4 flex flex-col gap-4">
          {/* 내 파송지 */}
          {myAssignedChurch ? (
            <section className="bg-white dark:bg-surface rounded-toss p-6 shadow-sm border border-toss-blue/20 mb-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MapPin size={120} className="text-toss-blue" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold bg-toss-blue text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                  My Assignment
                </span>
                <h2 className="text-sm font-bold text-toss-black">나의 파송지</h2>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-toss-black mb-1">{myAssignedChurch.name}</h3>
                <p className="text-sm text-toss-blue font-bold mb-4">{userGroup}조 파송</p>

                <div className="space-y-3">
                  <InfoRow icon={<Clock size={18} className="text-toss-gray mt-0.5" />} label="예배 시간" value={myAssignedChurch.worshipTime} />
                  <InfoRow icon={<MapPin size={18} className="text-toss-gray mt-0.5" />} label="주소" value={myAssignedChurch.address} />
                  <InfoRow icon={<Info size={18} className="text-toss-gray mt-0.5" />} label="사역 내용" value={myAssignedChurch.activities} />
                </div>
              </div>
            </section>
          ) : (
            <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
              {userGroup
                ? "배정된 아웃리치가 없습니다. 관리자에게 문의해주세요."
                : "조 배정이 필요합니다. 관리자에게 문의해주세요."}
            </div>
          )}

          <div className="px-1 mt-4">
            <h2 className="text-[15px] font-bold text-toss-black mb-1">전체 파송지 현황</h2>
            <p className="text-xs text-toss-gray mb-4">이번 수련회에서 함께 섬기는 아웃리치 목록입니다.</p>
          </div>

          {churches.length === 0 ? (
            <div className="bg-white dark:bg-surface p-8 rounded-toss text-center border border-toss-border/40 text-toss-gray text-sm">
              등록된 아웃리치가 없습니다.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {churches.map((church) => (
                <div
                  key={church.id}
                  className={clsx(
                    "bg-white dark:bg-surface rounded-toss p-5 shadow-sm border transition-all",
                    myAssignedChurch?.id === church.id
                      ? "border-toss-blue bg-blue-50/10"
                      : "border-toss-border/40"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-bold text-toss-black">{church.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-toss-gray font-medium flex items-center gap-1">
                          <Clock size={12} /> {church.worshipTime}
                        </span>
                      </div>
                    </div>
                    {myAssignedChurch?.id === church.id && (
                      <span className="text-[10px] font-bold bg-toss-blue text-white px-2 py-0.5 rounded-full shadow-sm shadow-toss-blue/20">
                        내 파송지
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2 items-start">
                      <MapPin size={14} className="text-toss-gray mt-0.5 shrink-0" />
                      <p className="text-[12px] text-toss-gray leading-relaxed">{church.address}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Info size={14} className="text-toss-gray mt-0.5 shrink-0" />
                      <p className="text-[12px] text-toss-gray leading-relaxed">{church.activities}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-toss-border/40">
                    <p className="text-[10px] font-bold text-toss-gray uppercase tracking-wider mb-2">배정된 조</p>
                    <div className="flex flex-wrap gap-1.5">
                      {church.assignedGroups.map((groupNum) => (
                        <span
                          key={groupNum}
                          className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                            groupNum === userGroup
                              ? "bg-toss-blue text-white"
                              : "bg-toss-lightGray text-toss-gray"
                          )}
                        >
                          {groupNum}조
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      {icon}
      <div className="flex flex-col">
        <p className="text-[11px] font-bold text-toss-gray uppercase">{label}</p>
        <p className="text-sm text-toss-black font-medium leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
