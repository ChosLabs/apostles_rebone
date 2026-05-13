"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bus, Users, Search, Save, Loader2,
  Check, UserCheck, X, Plus,
} from "lucide-react";
import { clsx } from "clsx";
import { db } from "@/lib/firebase/client";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { subscribeBuses, updateBusSchedule } from "@/lib/services/busService";
import { Bus as BusType, BusSchedule, BusRoster, Participant } from "@/types/database";

export default function BusAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.scheduleId as string;

  const [schedule, setSchedule] = useState<BusSchedule | null>(null);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // local draft
  const [busIds, setBusIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<{ [busId: string]: BusRoster }>({});

  // UI state
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [managerDropdown, setManagerDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const unsub = subscribeBuses((data) => {
      if (!cancelled) setBuses(data);
    });

    const loadData = async () => {
      try {
        const [snapSchedule, snapParticipants] = await Promise.all([
          getDoc(doc(db, "busSchedules", scheduleId)),
          getDocs(query(collection(db, "participants"), orderBy("group", "asc"))),
        ]);

        if (cancelled) return;
        if (!snapSchedule.exists()) { router.push("/admin/bus-assignment"); return; }

        const s = { id: snapSchedule.id, ...snapSchedule.data() } as BusSchedule;
        setSchedule(s);
        setBusIds(s.busIds ?? []);
        setAssignments(s.assignments ?? {});

        const pList = snapParticipants.docs.map((d) => ({ id: d.id, ...d.data() })) as Participant[];
        setParticipants(pList);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
      unsub();
    };
  }, [scheduleId, router]);

  // Set first bus as active when buses load
  useEffect(() => {
    if (!activeBusId && busIds.length > 0) setActiveBusId(busIds[0]);
  }, [busIds, activeBusId]);

  // Already-assigned participant IDs across all buses (excluding activeBusId)
  const assignedElsewhere = useCallback(
    (participantId: string) => {
      return Object.entries(assignments).some(
        ([busId, roster]) =>
          busId !== activeBusId &&
          roster.participants.some((p) => p.id === participantId)
      );
    },
    [assignments, activeBusId]
  );

  const activeRoster = activeBusId ? (assignments[activeBusId] ?? { managerId: null, managerName: null, participants: [] }) : null;

  const isParticipantChecked = (pid: string) =>
    activeRoster?.participants.some((p) => p.id === pid) ?? false;

  const toggleParticipant = (p: Participant) => {
    if (!activeBusId) return;
    const roster: BusRoster = assignments[activeBusId] ?? { managerId: null, managerName: null, participants: [] };
    const exists = roster.participants.some((r) => r.id === p.id);
    const updated: BusRoster = {
      ...roster,
      participants: exists
        ? roster.participants.filter((r) => r.id !== p.id)
        : [...roster.participants, { id: p.id, name: p.name, group: p.group, phone: p.phone }],
    };
    setAssignments((prev) => ({ ...prev, [activeBusId]: updated }));
  };

  const setManager = (p: Participant | null) => {
    if (!activeBusId) return;
    const roster: BusRoster = assignments[activeBusId] ?? { managerId: null, managerName: null, participants: [] };
    setAssignments((prev) => ({
      ...prev,
      [activeBusId]: { ...roster, managerId: p?.id ?? null, managerName: p?.name ?? null },
    }));
    setManagerDropdown(false);
    setManagerSearch("");
  };

  const toggleBusInSchedule = (busId: string) => {
    setBusIds((prev) => {
      const next = prev.includes(busId) ? prev.filter((id) => id !== busId) : [...prev, busId];
      if (!next.includes(activeBusId ?? "") && next.length > 0) setActiveBusId(next[0]);
      else if (next.length === 0) setActiveBusId(null);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateBusSchedule(scheduleId, { busIds, assignments });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("저장 실패"); } finally { setSaving(false); }
  };

  // Grouped participants by 조
  const groupedParticipants = participants.reduce<Record<number, Participant[]>>((acc, p) => {
    const g = p.group ?? 0;
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});
  const groupNums = Object.keys(groupedParticipants).map(Number).sort((a, b) => a - b);

  const filteredGroups = groupNums.map((g) => ({
    group: g,
    members: groupedParticipants[g].filter((p) => {
      if (!participantSearch) return true;
      const q = participantSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.phone ?? "").includes(q);
    }),
  })).filter((g) => g.members.length > 0);

  const managerFiltered = participantSearch
    ? participants.filter((p) => p.name.toLowerCase().includes(managerSearch.toLowerCase()))
    : participants.filter((p) => p.name.toLowerCase().includes(managerSearch.toLowerCase())).slice(0, 30);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-toss-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/bus-assignment")} className="p-2 hover:bg-toss-lightGray rounded-xl transition-colors">
          <ArrowLeft size={22} className="text-toss-black" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-toss-black">{schedule?.name}</h1>
          <p className="text-sm text-toss-gray mt-0.5">버스 선택 후 담당자와 참가자를 배정하세요.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
            saved
              ? "bg-emerald-500 text-white"
              : "bg-toss-blue text-white hover:bg-blue-600 disabled:opacity-60"
          )}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "저장됨" : "저장"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── 왼쪽: 버스 선택 패널 ── */}
        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-toss-gray uppercase tracking-wider">이 스케줄의 버스</h2>
          {buses.map((bus) => {
            const isIncluded = busIds.includes(bus.id);
            const roster = assignments[bus.id];
            const count = roster?.participants.length ?? 0;
            return (
              <div
                key={bus.id}
                className={clsx(
                  "rounded-2xl border p-4 cursor-pointer transition-all",
                  activeBusId === bus.id && isIncluded
                    ? "border-toss-blue bg-toss-blue/5 shadow-sm"
                    : isIncluded
                    ? "border-toss-border bg-white hover:border-toss-blue/40"
                    : "border-dashed border-toss-border bg-white opacity-60"
                )}
                onClick={() => {
                  if (!isIncluded) toggleBusInSchedule(bus.id);
                  setActiveBusId(bus.id);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-xl flex items-center justify-center",
                      isIncluded ? "bg-orange-50" : "bg-toss-lightGray"
                    )}>
                      <Bus size={16} className={isIncluded ? "text-orange-400" : "text-toss-gray"} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-toss-black">{bus.name}</p>
                      <p className="text-[11px] text-toss-gray">{bus.busNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isIncluded && (
                      <span className="text-[11px] font-bold text-toss-blue">{count}명</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBusInSchedule(bus.id); }}
                      className={clsx(
                        "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
                        isIncluded
                          ? "bg-toss-blue border-toss-blue text-white"
                          : "border-toss-border text-transparent"
                      )}
                    >
                      <Check size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* ── 오른쪽: 배정 패널 ── */}
        <main className="flex flex-col gap-5">
          {!activeBusId || !busIds.includes(activeBusId) ? (
            <div className="bg-white rounded-2xl border border-dashed border-toss-border p-12 text-center text-toss-gray text-sm">
              왼쪽에서 버스를 선택하세요
            </div>
          ) : (
            <>
              {/* 버스 탭 */}
              <div className="flex gap-2 flex-wrap">
                {busIds.map((bid) => {
                  const b = buses.find((x) => x.id === bid);
                  return b ? (
                    <button
                      key={bid}
                      onClick={() => setActiveBusId(bid)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                        activeBusId === bid
                          ? "bg-toss-blue text-white border-toss-blue"
                          : "bg-white text-toss-gray border-toss-border hover:border-toss-blue/40"
                      )}
                    >
                      {b.name}
                      <span className="ml-1.5 opacity-70">
                        {assignments[bid]?.participants.length ?? 0}
                      </span>
                    </button>
                  ) : null;
                })}
              </div>

              {(() => {
                const activeBus = buses.find((b) => b.id === activeBusId);
                const roster = assignments[activeBusId] ?? { managerId: null, managerName: null, participants: [] };

                return (
                  <div className="bg-white rounded-2xl border border-toss-border overflow-hidden">
                    {/* 버스 헤더 */}
                    <div className="px-6 py-4 border-b border-toss-border bg-toss-lightGray/30 flex items-center gap-3">
                      <Bus size={18} className="text-orange-400" />
                      <div>
                        <p className="font-bold text-toss-black">{activeBus?.name}</p>
                        <p className="text-xs text-toss-gray">{activeBus?.busNumber}</p>
                      </div>
                      <span className="ml-auto text-sm font-bold text-toss-blue">
                        {roster.participants.length}명 배정
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* 담당자 */}
                      <div>
                        <label className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <UserCheck size={13} className="text-toss-blue" />
                          담당자
                        </label>
                        <div className="relative">
                          <div
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-toss-border cursor-pointer hover:border-toss-blue/50 transition-colors bg-white"
                            onClick={() => setManagerDropdown((v) => !v)}
                          >
                            {roster.managerName ? (
                              <>
                                <div className="w-7 h-7 rounded-full bg-toss-blue/10 flex items-center justify-center text-toss-blue text-xs font-bold">
                                  {roster.managerName[0]}
                                </div>
                                <span className="text-sm font-bold text-toss-black">{roster.managerName}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setManager(null); }}
                                  className="ml-auto text-toss-gray hover:text-red-500 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-toss-gray">담당자 선택...</span>
                            )}
                          </div>

                          {managerDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-toss-border rounded-xl shadow-lg z-20 overflow-hidden">
                              <div className="p-2 border-b border-toss-border">
                                <div className="flex items-center gap-2 px-3 py-2 bg-toss-lightGray/50 rounded-lg">
                                  <Search size={14} className="text-toss-gray" />
                                  <input
                                    type="text"
                                    value={managerSearch}
                                    onChange={(e) => setManagerSearch(e.target.value)}
                                    placeholder="이름 검색..."
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              <div className="max-h-52 overflow-y-auto">
                                {managerFiltered.map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() => setManager(p)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-toss-lightGray/50 transition-colors text-left"
                                  >
                                    <span className="text-sm font-bold text-toss-black">{p.name}</span>
                                    {p.group && (
                                      <span className="text-[11px] font-bold text-toss-blue bg-toss-blue/10 px-1.5 py-0.5 rounded">
                                        {p.group}조
                                      </span>
                                    )}
                                  </button>
                                ))}
                                {managerFiltered.length === 0 && (
                                  <p className="text-center text-xs text-toss-gray py-4">검색 결과 없음</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 참가자 */}
                      <div>
                        <label className="text-xs font-bold text-toss-gray uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users size={13} className="text-toss-blue" />
                            참가자
                          </span>
                          <span className="text-toss-blue normal-case font-bold">
                            {roster.participants.length}명 선택
                          </span>
                        </label>

                        <div className="flex items-center gap-2 px-3 py-2.5 bg-toss-lightGray/50 rounded-xl border border-toss-border mb-3">
                          <Search size={14} className="text-toss-gray shrink-0" />
                          <input
                            type="text"
                            value={participantSearch}
                            onChange={(e) => setParticipantSearch(e.target.value)}
                            placeholder="이름 또는 전화번호 뒤 4자리 검색..."
                            className="flex-1 bg-transparent text-sm outline-none"
                          />
                          {participantSearch && (
                            <button onClick={() => setParticipantSearch("")}>
                              <X size={14} className="text-toss-gray" />
                            </button>
                          )}
                        </div>

                        <div className="border border-toss-border rounded-xl overflow-hidden divide-y divide-toss-border/50 max-h-[480px] overflow-y-auto">
                          {filteredGroups.map(({ group, members }) => (
                            <div key={group}>
                              <div className="px-4 py-2 bg-toss-lightGray/40 flex items-center justify-between">
                                <span className="text-[11px] font-black text-toss-gray uppercase tracking-wider">
                                  {group === 0 ? "조 미배정" : `${group}조`}
                                </span>
                                <span className="text-[11px] text-toss-gray">
                                  {members.filter((p) => isParticipantChecked(p.id)).length}/{members.length}
                                </span>
                              </div>
                              {members.map((p) => {
                                const checked = isParticipantChecked(p.id);
                                const elsewhere = assignedElsewhere(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={clsx(
                                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                      checked
                                        ? "bg-toss-blue/5 hover:bg-toss-blue/8"
                                        : elsewhere
                                        ? "opacity-40 cursor-not-allowed bg-toss-lightGray/30"
                                        : "bg-white hover:bg-toss-lightGray/30"
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={elsewhere}
                                      onChange={() => !elsewhere && toggleParticipant(p)}
                                      className="w-4 h-4 accent-toss-blue rounded"
                                    />
                                    <span className="text-sm font-bold text-toss-black flex-1">{p.name}</span>
                                    {p.group && (
                                      <span className={clsx(
                                        "text-[11px] font-bold px-1.5 py-0.5 rounded",
                                        checked ? "bg-toss-blue/15 text-toss-blue" : "bg-toss-lightGray text-toss-gray"
                                      )}>
                                        {p.group}조
                                      </span>
                                    )}
                                    <span className="text-[11px] text-toss-gray font-mono w-10 text-right">
                                      {p.phone ? p.phone.slice(-4) : "—"}
                                    </span>
                                    {elsewhere && (
                                      <span className="text-[10px] text-orange-400 font-bold">타버스</span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                          {filteredGroups.length === 0 && (
                            <div className="py-8 text-center text-sm text-toss-gray">검색 결과 없음</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
