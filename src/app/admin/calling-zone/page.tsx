"use client";

import { useState, useEffect } from "react";
import { Globe, Briefcase, Users, Mic2, Sparkles, Save, Loader2, CheckCircle2, Users2, Key } from "lucide-react";
import {
  subscribeCallingZoneConfig,
  subscribeAllCallingStamps,
  updateBoothCode,
} from "@/lib/services/callingZoneService";
import { getParticipants } from "@/lib/services/participantService";
import { CallingZoneConfig, CallingStamp } from "@/types/database";

type ZoneMeta = {
  id: string;
  letter: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
};

const ZONES: ZoneMeta[] = [
  { id: "zone-a", letter: "A", name: "Mission & Global",      icon: <Globe size={18} />,     color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { id: "zone-b", letter: "B", name: "Life & Vocation",       icon: <Briefcase size={18} />, color: "#3182f6", bg: "rgba(49,130,246,0.1)" },
  { id: "zone-c", letter: "C", name: "Community & Re:bond",   icon: <Users size={18} />,     color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  { id: "zone-d", letter: "D", name: "Confession & Story",    icon: <Mic2 size={18} />,      color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  { id: "zone-e", letter: "E", name: "Prayer & Healing",      icon: <Sparkles size={18} />,  color: "#B45309", bg: "rgba(180,83,9,0.1)" },
];

const ALL_ZONE_IDS = ZONES.map((z) => z.id);

export default function AdminCallingZonePage() {
  const [config, setConfig] = useState<CallingZoneConfig | null>(null);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [allStamps, setAllStamps] = useState<CallingStamp[]>([]);
  const [phoneMap, setPhoneMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubConfig = subscribeCallingZoneConfig((cfg) => {
      setConfig(cfg);
      const initial: Record<string, string> = {};
      ZONES.forEach((z) => { initial[z.id] = cfg.booths[z.id]?.code ?? ""; });
      setCodes(initial);
      setLoading(false);
    });
    const unsubStamps = subscribeAllCallingStamps(setAllStamps);
    getParticipants().then((list) => {
      const map: Record<string, string> = {};
      list.forEach((p) => { map[p.id] = p.phone ? p.phone.replace(/-/g, "").slice(-4) : ""; });
      setPhoneMap(map);
    });
    return () => { unsubConfig(); unsubStamps(); };
  }, []);

  const handleSaveCode = async (zoneId: string) => {
    const code = codes[zoneId]?.trim();
    if (!code || code.length !== 4) { alert("4자리 코드를 입력해주세요."); return; }
    try {
      setSavingId(zoneId);
      await updateBoothCode(zoneId, code);
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  const completedAll = allStamps.filter((s) => ALL_ZONE_IDS.every((id) => s.stamps?.includes(id)));
  const stampCountPerZone = ZONES.map((z) => ({
    ...z,
    count: allStamps.filter((s) => s.stamps?.includes(z.id)).length,
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
        <p className="text-sm text-toss-gray mt-1">5개 존 스탬프 코드를 관리하고 완료 참가자 명단을 확인합니다.</p>
      </div>

      {/* 현황 요약 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stampCountPerZone.map((z) => (
          <div key={z.id} className="bg-white p-4 rounded-3xl shadow-sm border border-toss-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-base" style={{ backgroundColor: z.bg, color: z.color }}>
              {z.letter}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-toss-gray truncate">{z.name}</p>
              <p className="text-xl font-black text-toss-black">{z.count}명</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 스탬프 코드 관리 */}
        <div className="bg-white rounded-3xl shadow-sm border border-toss-border overflow-hidden">
          <div className="px-6 py-5 border-b border-toss-border flex items-center gap-2">
            <Key size={18} className="text-toss-blue" />
            <h2 className="font-bold text-toss-black">존별 스탬프 코드</h2>
          </div>
          <div className="p-6 space-y-4">
            {ZONES.map((zone) => (
              <div key={zone.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base" style={{ backgroundColor: zone.bg, color: zone.color }}>
                  {zone.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-toss-gray mb-1">{zone.name}</p>
                  <input
                    type="text"
                    value={codes[zone.id] ?? ""}
                    onChange={(e) => setCodes((prev) => ({ ...prev, [zone.id]: e.target.value }))}
                    maxLength={4}
                    placeholder="4자리 코드"
                    className="w-full px-3 py-2 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-black text-lg tracking-widest text-center transition-colors"
                  />
                </div>
                <button
                  onClick={() => handleSaveCode(zone.id)}
                  disabled={savingId === zone.id}
                  className="shrink-0 bg-toss-blue text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  {savingId === zone.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
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
            <span className="text-sm font-black text-toss-blue bg-toss-blue/8 px-3 py-1 rounded-xl">{completedAll.length}명</span>
          </div>
          <div className="divide-y divide-toss-border max-h-[420px] overflow-y-auto">
            {completedAll.length === 0 ? (
              <div className="p-12 text-center text-toss-gray text-sm">아직 전체 스탬프를 완료한 참가자가 없습니다.</div>
            ) : (
              completedAll.map((stamp, i) => (
                <div key={stamp.userId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-toss-gray/40 w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-toss-black">{stamp.userName}</p>
                      {(stamp.userTeam || phoneMap[stamp.userId]) && (
                        <p className="text-xs text-toss-blue font-bold">
                          {stamp.userTeam}{phoneMap[stamp.userId] && `${stamp.userTeam ? " · " : ""}${phoneMap[stamp.userId]}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {ZONES.map((z) => (
                      <div
                        key={z.id}
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                        style={{
                          backgroundColor: stamp.stamps?.includes(z.id) ? z.bg : "rgba(0,0,0,0.04)",
                          color: stamp.stamps?.includes(z.id) ? z.color : "rgba(0,0,0,0.2)",
                        }}
                      >
                        {z.letter}
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
            <Users2 size={18} className="text-toss-blue" />
            <h2 className="font-bold text-toss-black">전체 참가자 스탬프 현황</h2>
          </div>
          <span className="text-sm font-bold text-toss-gray">{allStamps.length}명 참여</span>
        </div>
        <div className="divide-y divide-toss-border max-h-[480px] overflow-y-auto">
          {allStamps.length === 0 ? (
            <div className="p-12 text-center text-toss-gray text-sm">아직 스탬프를 받은 참가자가 없습니다.</div>
          ) : (
            [...allStamps]
              .sort((a, b) => (b.stamps?.length ?? 0) - (a.stamps?.length ?? 0))
              .map((stamp) => (
                <div key={stamp.userId} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-toss-black">{stamp.userName}</p>
                    {(stamp.userTeam || phoneMap[stamp.userId]) && (
                      <p className="text-xs text-toss-gray">
                        {stamp.userTeam}{phoneMap[stamp.userId] && `${stamp.userTeam ? " · " : ""}${phoneMap[stamp.userId]}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      (stamp.stamps?.length ?? 0) >= 5
                        ? "bg-green-50 text-green-600"
                        : "bg-toss-lightGray text-toss-gray"
                    }`}>
                      {stamp.stamps?.length ?? 0} / 5
                    </span>
                    <div className="flex gap-1">
                      {ZONES.map((z) => (
                        <div
                          key={z.id}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                          style={{
                            backgroundColor: stamp.stamps?.includes(z.id) ? z.bg : "rgba(0,0,0,0.04)",
                            color: stamp.stamps?.includes(z.id) ? z.color : "rgba(0,0,0,0.2)",
                          }}
                        >
                          {z.letter}
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
