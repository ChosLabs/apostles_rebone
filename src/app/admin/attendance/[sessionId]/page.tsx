"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, X, Search, Loader2, UserCheck,
  Users, CheckCircle2, Circle, Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeAttendanceSession,
  updateAttendanceSession,
} from "@/lib/services/attendanceService";
import { getParticipants, getParticipantsByGroup } from "@/lib/services/participantService";
import {
  AttendanceSession, AttendanceGroup, AttendanceManager,
  AttendanceParticipant, Participant,
} from "@/types/database";

function toParticipant(p: Participant): AttendanceParticipant {
  const result: AttendanceParticipant = { id: p.id, name: p.name };
  if (p.group !== undefined) result.group = p.group;
  if (p.phone !== undefined) result.phone = p.phone;
  return result;
}

export default function AdminAttendanceDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [managerSearch, setManagerSearch] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [groupNumInput, setGroupNumInput] = useState("");
  const [addingGroupName, setAddingGroupName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsub = subscribeAttendanceSession(sessionId, (data) => {
      if (cancelled) return;
      setSession(data);
      setLoading(false);
    });
    getParticipants().then((data) => { if (!cancelled) setAllParticipants(data); });
    return () => { cancelled = true; unsub(); };
  }, [sessionId]);

  const selectedGroup = session?.groups?.find((g) => g.id === selectedGroupId) ?? null;
  const allAssignedIds = new Set(session?.groups?.flatMap((g) => g.participants.map((p) => p.id)) ?? []);

  const updateGroups = (groups: AttendanceGroup[]) =>
    updateAttendanceSession(sessionId, { groups });

  // ── Managers (session-level) ──
  const addManager = async (p: Participant) => {
    if (!session || (session.managers ?? []).some((m) => m.id === p.id)) return;
    await updateAttendanceSession(sessionId, {
      managers: [...(session.managers ?? []), { id: p.id, name: p.name }],
    });
    setManagerSearch("");
  };

  const removeManager = async (id: string) => {
    if (!session) return;
    await updateAttendanceSession(sessionId, {
      managers: (session.managers ?? []).filter((m) => m.id !== id),
    });
  };

  // ── Participants (per-group) ──
  const addParticipant = async (p: Participant) => {
    if (!session || !selectedGroupId || allAssignedIds.has(p.id)) return;
    await updateGroups((session.groups ?? []).map((g) =>
      g.id === selectedGroupId ? { ...g, participants: [...g.participants, toParticipant(p)] } : g
    ));
    setParticipantSearch("");
  };

  const addByGroupNum = async () => {
    const num = parseInt(groupNumInput);
    if (!session || !selectedGroupId || !num) return;
    setSavingGroup(true);
    try {
      const members = await getParticipantsByGroup(num);
      const toAdd = members.filter((p) => !allAssignedIds.has(p.id)).map(toParticipant);
      if (toAdd.length === 0) { alert("추가할 참가자가 없습니다. (이미 배정되었거나 해당 조가 없음)"); return; }
      await updateGroups((session.groups ?? []).map((g) =>
        g.id === selectedGroupId ? { ...g, participants: [...g.participants, ...toAdd] } : g
      ));
      setGroupNumInput("");
    } finally { setSavingGroup(false); }
  };

  const removeParticipant = async (pid: string) => {
    if (!session || !selectedGroupId) return;
    await updateGroups((session.groups ?? []).map((g) =>
      g.id === selectedGroupId ? { ...g, participants: g.participants.filter((p) => p.id !== pid) } : g
    ));
  };

  // ── Group CRUD ──
  const addGroup = async () => {
    if (!session || !addingGroupName.trim()) return;
    const newGroup: AttendanceGroup = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: addingGroupName.trim(),
      participants: [],
    };
    await updateGroups([...(session.groups ?? []), newGroup]);
    setAddingGroupName("");
    setShowAddGroup(false);
    setSelectedGroupId(newGroup.id);
  };

  const removeGroup = async (groupId: string) => {
    if (!session || !confirm("그룹을 삭제하면 배정된 참가자도 모두 제거됩니다.")) return;
    await updateGroups((session.groups ?? []).filter((g) => g.id !== groupId));
    if (selectedGroupId === groupId) setSelectedGroupId(null);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-toss-blue" size={32} /></div>;
  if (!session) return <div className="text-center py-20 text-toss-gray font-bold">존재하지 않는 항목입니다.</div>;

  const records = session.records ?? {};
  const managers = session.managers ?? [];

  const managerCandidates = managerSearch.length >= 1
    ? allParticipants.filter((p) =>
        p.name.includes(managerSearch) && !managers.some((m) => m.id === p.id)
      ).slice(0, 5)
    : [];

  const participantCandidates = participantSearch.length >= 1
    ? allParticipants.filter((p) =>
        p.name.includes(participantSearch) && !allAssignedIds.has(p.id)
      ).slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/attendance")} className="p-2 hover:bg-toss-lightGray rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-toss-gray" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-toss-black">{session.name}</h1>
          <p className="text-sm text-toss-gray">담당자와 분류별 참가자를 관리합니다.</p>
        </div>
      </div>

      {/* Managers (session-level, full width) */}
      <section className="bg-white rounded-2xl border border-toss-border p-5 flex flex-col gap-3">
        <h2 className="text-base font-bold text-toss-black flex items-center gap-2">
          <UserCheck size={16} className="text-violet-500" />
          출석 담당자 ({managers.length}명)
          <span className="text-xs font-normal text-toss-gray ml-1">— 담당자로 등록된 유저는 모든 분류의 출석 관리 권한을 가집니다.</span>
        </h2>

        <div className="flex flex-wrap gap-2">
          {managers.map((m) => (
            <div key={m.id} className="flex items-center gap-1.5 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl text-sm font-bold">
              {m.name}
              <button onClick={() => removeManager(m.id)} className="text-violet-300 hover:text-red-500 transition-colors ml-0.5">
                <X size={13} />
              </button>
            </div>
          ))}
          {managers.length === 0 && (
            <p className="text-xs text-toss-gray">담당자가 없습니다.</p>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input
            type="text"
            value={managerSearch}
            onChange={(e) => setManagerSearch(e.target.value)}
            placeholder="이름으로 담당자 검색 후 추가"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-toss-border focus:border-violet-400 outline-none text-sm"
          />
          {managerCandidates.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-toss-border rounded-xl shadow-lg z-10 overflow-hidden">
              {managerCandidates.map((p) => (
                <button key={p.id} onClick={() => addManager(p)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-toss-lightGray flex items-center gap-2">
                  <span className="font-bold">{p.name}</span>
                  {p.group && <span className="text-[11px] text-toss-gray">{p.group}조</span>}
                  {p.phone && <span className="text-[11px] text-toss-gray">· {p.phone.slice(-4)}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Groups + Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: Group list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-toss-gray uppercase tracking-wider">세부 분류 ({session.groups?.length ?? 0})</span>
            <button onClick={() => setShowAddGroup((v) => !v)} className="p-1.5 text-toss-blue hover:bg-toss-blue/10 rounded-lg transition-colors">
              <Plus size={16} />
            </button>
          </div>

          {showAddGroup && (
            <div className="flex gap-2">
              <input
                type="text"
                value={addingGroupName}
                onChange={(e) => setAddingGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                placeholder="분류 이름"
                className="flex-1 px-3 py-2 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm"
                autoFocus
              />
              <button onClick={addGroup} className="px-3 py-2 bg-toss-blue text-white rounded-xl text-sm font-bold">추가</button>
            </div>
          )}

          {(session.groups?.length ?? 0) === 0 ? (
            <div className="bg-white rounded-2xl border border-toss-border p-6 text-center text-sm text-toss-gray">
              + 버튼으로 분류를 추가하세요.
            </div>
          ) : (
            (session.groups ?? []).map((g) => {
              const gAttended = g.participants.filter((p) => records[p.id]?.attended).length;
              const isSelected = g.id === selectedGroupId;
              return (
                <div
                  key={g.id}
                  className={clsx(
                    "rounded-2xl border p-3 cursor-pointer transition-all group",
                    isSelected ? "border-toss-blue bg-toss-blue/5" : "border-toss-border bg-white hover:border-toss-blue/40"
                  )}
                  onClick={() => setSelectedGroupId(g.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm font-bold truncate", isSelected ? "text-toss-blue" : "text-toss-black")}>{g.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-toss-gray">{g.participants.length}명</span>
                        {g.participants.length > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600">{gAttended}/{g.participants.length} 출석</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeGroup(g.id); }}
                      className="p-1 text-transparent group-hover:text-red-400 hover:!text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {g.participants.length > 0 && (
                    <div className="h-1 bg-toss-lightGray rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${(gAttended / g.participants.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected group participants */}
        {selectedGroup ? (
          <section className="bg-white rounded-2xl border border-toss-border p-5 flex flex-col gap-3">
            <h2 className="text-base font-bold text-toss-black flex items-center gap-2">
              <Users size={16} className="text-toss-blue" />
              {selectedGroup.name} · 참가자 ({selectedGroup.participants.length}명)
            </h2>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
              <input
                type="text"
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                placeholder="이름으로 개별 추가"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm"
              />
              {participantCandidates.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-toss-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {participantCandidates.map((p) => (
                    <button key={p.id} onClick={() => addParticipant(p)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-toss-lightGray flex items-center gap-2">
                      <span className="font-bold">{p.name}</span>
                      {p.group && <span className="text-[11px] text-toss-gray">{p.group}조</span>}
                      {p.phone && <span className="text-[11px] text-toss-gray">· {p.phone.slice(-4)}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={groupNumInput}
                onChange={(e) => setGroupNumInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addByGroupNum()}
                placeholder="조 번호"
                className="w-28 px-3 py-2.5 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-medium"
              />
              <button
                onClick={addByGroupNum}
                disabled={savingGroup || !groupNumInput}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-toss-blue/10 text-toss-blue rounded-xl text-sm font-bold hover:bg-toss-blue/20 transition-colors disabled:opacity-50"
              >
                {savingGroup ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                조 일괄 추가
              </button>
            </div>

            <div className="flex flex-col gap-1 max-h-80 overflow-y-auto border-t border-toss-border/40 pt-2">
              {selectedGroup.participants.length === 0 ? (
                <p className="text-xs text-toss-gray text-center py-6">배정된 참가자가 없습니다.</p>
              ) : (
                selectedGroup.participants.map((p) => {
                  const attended = records[p.id]?.attended;
                  return (
                    <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-toss-lightGray/50 group">
                      {attended
                        ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        : <Circle size={14} className="text-toss-border shrink-0" />
                      }
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-toss-black">{p.name}</span>
                        {p.group && <span className="text-[11px] font-bold bg-toss-lightGray text-toss-gray px-1.5 py-0.5 rounded-md shrink-0">{p.group}조</span>}
                        {p.phone && <span className="text-[11px] text-toss-gray shrink-0">{p.phone.slice(-4)}</span>}
                      </div>
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="p-1 text-transparent group-hover:text-red-400 hover:!text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        ) : (
          <div className="bg-white rounded-2xl border border-toss-border p-12 text-center text-toss-gray text-sm">
            왼쪽에서 분류를 선택하면 참가자를 관리할 수 있습니다.
          </div>
        )}
      </div>
    </div>
  );
}
