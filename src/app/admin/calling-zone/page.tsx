"use client";

import { useState, useEffect } from "react";
import { Coffee, Heart, Palette, Zap, Save, Loader2, CheckCircle2, Users, Key } from "lucide-react";
import {
  subscribeCallingZoneConfig,
  subscribeAllCallingStamps,
  updateBoothCode,
} from "@/lib/services/callingZoneService";
import { CallingZoneConfig, CallingStamp } from "@/types/database";

type BoothMeta = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const BOOTHS: BoothMeta[] = [
  { id: "comfort",    name: "Comfort Zone", icon: <Coffee size={20} />,  color: "#FF8A65", bg: "rgba(255,138,101,0.1)" },
  { id: "prayer",     name: "Prayer Zone",  icon: <Heart size={20} />,   color: "#3182f6", bg: "rgba(49,130,246,0.1)" },
  { id: "experience", name: "체험 부스",     icon: <Palette size={20} />, color: "#4CAF50", bg: "rgba(76,175,80,0.1)" },
  { id: "activity",   name: "Activity Zone",icon: <Zap size={20} />,     color: "#9C6ADE", bg: "rgba(156,106,222,0.1)" },
];

const ALL_BOOTH_IDS = BOOTHS.map((b) => b.id);

export default function AdminCallingZonePage() {
  const [config, setConfig] = useState<CallingZoneConfig | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [allStamps, setAllStamps] = useState<CallingStamp[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubConfig = subscribeCallingZoneConfig((cfg) => {
      setConfig(cfg);
      const initial: Record<string, string> = {};
      BOOTHS.forEach((b) => {
        initial[b.id] = cfg.booths[b.id]?.code ?? "";
      });
      setCodes(initial);
      setLoading(false);
    });

    const unsubStamps = subscribeAllCallingStamps(setAllStamps);

    return () => {
      unsubConfig();
      unsubStamps();
    };
  }, []);

  const handleSaveCode = async (boothId: string) => {
    const code = codes[boothId]?.trim();
    if (!code || code.length !== 4) {
      alert("4자리 코드를 입력해주세요.");
      return;
    }
    try {
      setSavingId(boothId);
      await updateBoothCode(boothId, code);
    } catch (e) {
      alert("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const completedAll = allStamps.filter((s) =>
    ALL_BOOTH_IDS.every((id) => s.stamps?.includes(id))
  );

  const stampCountPerBooth = BOOTHS.map((b) => ({
    ...b,
    count: allStamps.filter((s) => s.stamps?.includes(b.id)).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-toss-blue" size={36} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-toss-black">콜링존 관리</h1>
        <p className="text-sm text-toss-gray mt-1">4대 부스 스탬프 코드를 관리하고 완료 참가자 명단을 확인합니다.</p>
      </div>

      {/* 현황 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stampCountPerBooth.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-3xl shadow-sm border border-toss-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: b.bg, color: b.color }}>
              {b.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-toss-gray">{b.name}</p>
              <p className="text-xl font-black text-toss-black">{b.count}명</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 스탬프 코드 관리 */}
        <div className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden">
          <div className="px-6 py-5 border-b border-toss-border flex items-center gap-2">
            <Key size={18} className="text-toss-blue" />
            <h2 className="font-bold text-toss-black">부스별 스탬프 코드</h2>
          </div>
          <div className="p-6 space-y-4">
            {BOOTHS.map((booth) => (
              <div key={booth.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: booth.bg, color: booth.color }}
                >
                  {booth.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-toss-gray mb-1">{booth.name}</p>
                  <input
                    type="text"
                    value={codes[booth.id] ?? ""}
                    onChange={(e) =>
                      setCodes((prev) => ({ ...prev, [booth.id]: e.target.value }))
                    }
                    maxLength={4}
                    placeholder="4자리 코드"
                    className="w-full px-3 py-2 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-black text-lg tracking-widest text-center transition-colors"
                  />
                </div>
                <button
                  onClick={() => handleSaveCode(booth.id)}
                  disabled={savingId === booth.id}
                  className="shrink-0 bg-toss-blue text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {savingId === booth.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  저장
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 전체 완료 참가자 */}
        <div className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden">
          <div className="px-6 py-5 border-b border-toss-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <h2 className="font-bold text-toss-black">전체 스탬프 완료</h2>
            </div>
            <span className="text-sm font-black text-toss-blue bg-toss-blue/8 px-3 py-1 rounded-xl">
              {completedAll.length}명
            </span>
          </div>
          <div className="divide-y divide-toss-border max-h-[420px] overflow-y-auto">
            {completedAll.length === 0 ? (
              <div className="p-12 text-center text-toss-gray text-sm">
                아직 전체 스탬프를 완료한 참가자가 없습니다.
              </div>
            ) : (
              completedAll.map((stamp, i) => (
                <div key={stamp.userId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-toss-gray/40 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-toss-black">{stamp.userName}</p>
                      {stamp.userTeam && (
                        <p className="text-xs text-toss-blue font-bold">{stamp.userTeam}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {BOOTHS.map((b) => (
                      <div
                        key={b.id}
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: stamp.stamps?.includes(b.id) ? b.bg : "rgba(0,0,0,0.04)", color: b.color }}
                        title={b.name}
                      >
                        {stamp.stamps?.includes(b.id) && <CheckCircle2 size={12} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 전체 참가자 스탬프 현황 */}
      <div className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden">
        <div className="px-6 py-5 border-b border-toss-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-toss-blue" />
            <h2 className="font-bold text-toss-black">전체 참가자 스탬프 현황</h2>
          </div>
          <span className="text-sm font-bold text-toss-gray">{allStamps.length}명 참여</span>
        </div>
        <div className="divide-y divide-toss-border max-h-[480px] overflow-y-auto">
          {allStamps.length === 0 ? (
            <div className="p-12 text-center text-toss-gray text-sm">
              아직 스탬프를 받은 참가자가 없습니다.
            </div>
          ) : (
            [...allStamps]
              .sort((a, b) => (b.stamps?.length ?? 0) - (a.stamps?.length ?? 0))
              .map((stamp) => (
                <div key={stamp.userId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-toss-black">{stamp.userName}</p>
                      {stamp.userTeam && (
                        <p className="text-xs text-toss-gray">{stamp.userTeam}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      stamp.stamps?.length === 4
                        ? "bg-green-50 text-green-600"
                        : "bg-toss-lightGray text-toss-gray"
                    }`}>
                      {stamp.stamps?.length ?? 0} / 4
                    </span>
                    <div className="flex gap-1">
                      {BOOTHS.map((b) => (
                        <div
                          key={b.id}
                          className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: stamp.stamps?.includes(b.id) ? b.bg : "rgba(0,0,0,0.04)",
                            color: b.color,
                          }}
                          title={b.name}
                        >
                          {stamp.stamps?.includes(b.id) && <CheckCircle2 size={12} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
