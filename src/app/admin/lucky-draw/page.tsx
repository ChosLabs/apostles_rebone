"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Gift, Users,
  X, Save, Check, Sparkles, UserPlus, Loader2
} from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeLuckyDraws,
  createLuckyDraw,
  startDraw,
  completeDraw,
  deleteLuckyDraw,
} from "@/lib/services/luckyDrawService";
import { LuckyDraw } from "@/types/database";

const TEAMS = ["1팀", "2팀", "3팀", "4팀", "5팀", "6팀", "초신자팀", "기신자팀", "웰컴팀", "임원단", "사역자"];
const GROUPS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function AdminLuckyDrawPage() {
  const [draws, setDraws] = useState<LuckyDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [newDraw, setNewDraw] = useState({
    title: "",
    targetTeams: [] as string[],
    targetGroups: [] as number[],
    winnerCount: 1,
  });

  useEffect(() => {
    const unsub = subscribeLuckyDraws((data) => {
      setDraws(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const toggleTeam = (team: string) =>
    setNewDraw((prev) => ({
      ...prev,
      targetTeams: prev.targetTeams.includes(team)
        ? prev.targetTeams.filter((t) => t !== team)
        : [...prev.targetTeams, team],
    }));

  const toggleGroup = (group: number) =>
    setNewDraw((prev) => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(group)
        ? prev.targetGroups.filter((g) => g !== group)
        : [...prev.targetGroups, group],
    }));

  const handleCreate = async () => {
    if (!newDraw.title) {
      alert("추첨 타이틀을 입력해주세요.");
      return;
    }
    try {
      await createLuckyDraw(newDraw);
      setIsModalOpen(false);
      setNewDraw({ title: "", targetTeams: [], targetGroups: [], winnerCount: 1 });
    } catch (e) {
      alert("생성에 실패했습니다.");
    }
  };

  const handleShowResults = async (draw: LuckyDraw) => {
    if (!confirm("추첨 결과를 표출하시겠습니까? 모든 참가자 화면에 결과가 공개됩니다.")) return;
    try {
      setProcessingId(draw.id);
      await startDraw(draw.id);
      await completeDraw(draw);
    } catch (e) {
      alert("추첨 중 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 추첨을 삭제하시겠습니까?")) return;
    try {
      await deleteLuckyDraw(id);
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-toss-black flex items-center gap-2">
            <Gift className="text-toss-blue" />
            추첨 관리
          </h1>
          <p className="text-sm text-toss-gray mt-1">추첨 이벤트를 생성하고 실시간으로 결과를 표출합니다.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-toss-blue text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-toss-blue/20 active:scale-95"
        >
          <Plus size={20} />
          새 추첨 만들기
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {draws.map((draw) => (
            <div key={draw.id} className="bg-white rounded-[32px] shadow-sm border border-toss-border/60 overflow-hidden transition-all hover:shadow-md">
              <div className="p-8 border-b border-toss-border/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    draw.status === "completed" ? "bg-toss-lightGray text-toss-gray" : "bg-toss-blue/10 text-toss-blue"
                  )}>
                    <Gift size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-toss-black">{draw.title}</h3>
                      <span className={clsx(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        draw.status === "completed"
                          ? "bg-toss-lightGray text-toss-gray"
                          : draw.status === "drawing"
                          ? "bg-toss-blue text-white animate-pulse"
                          : "bg-blue-50 text-toss-blue"
                      )}>
                        {draw.status === "completed" ? "완료" : draw.status === "drawing" ? "추첨 중..." : "대기 중"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-toss-gray font-medium">
                      <span className="flex items-center gap-1"><UserPlus size={14} /> 당첨 {draw.winnerCount}명</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {draw.status === "pending" && (
                    <button
                      onClick={() => handleShowResults(draw)}
                      disabled={processingId === draw.id}
                      className="flex-1 lg:flex-none px-6 py-3 bg-toss-blue text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md shadow-toss-blue/10 active:scale-95 disabled:opacity-60"
                    >
                      {processingId === draw.id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Sparkles size={18} />
                      )}
                      결과 표출
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(draw.id)}
                    className="p-3 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 bg-toss-lightGray/10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-toss-gray uppercase tracking-[0.2em]">대상 필터</p>
                  <div className="bg-white p-4 rounded-2xl border border-toss-border/40 space-y-3">
                    <div>
                      <p className="text-[11px] text-toss-gray mb-2 font-bold uppercase">대상 팀</p>
                      <div className="flex flex-wrap gap-1.5">
                        {draw.targetTeams.length > 0
                          ? draw.targetTeams.map((t) => (
                              <span key={t} className="px-2.5 py-1 bg-toss-blue/5 border border-toss-blue/10 rounded-lg text-[11px] font-bold text-toss-blue">{t}</span>
                            ))
                          : <span className="text-[11px] text-toss-gray italic">전체 팀 대상</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-toss-gray mb-2 font-bold uppercase">대상 조</p>
                      <div className="flex flex-wrap gap-1.5">
                        {draw.targetGroups.length > 0
                          ? draw.targetGroups.map((g) => (
                              <span key={g} className="w-8 h-8 flex items-center justify-center bg-toss-black/5 border border-toss-black/10 rounded-lg text-[11px] font-black text-toss-black">{g}</span>
                            ))
                          : <span className="text-[11px] text-toss-gray italic">전체 조 대상</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-toss-gray uppercase tracking-[0.2em]">당첨자 명단</p>
                  <div className="bg-white border border-toss-border/40 rounded-3xl overflow-hidden shadow-sm">
                    {draw.winners.length > 0 ? (
                      <div className="divide-y divide-toss-border/40">
                        {draw.winners.map((w, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-yellow-50/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-white shadow-sm">
                                <Check size={18} />
                              </div>
                              <span className="text-[15px] font-black text-toss-black">{w.userName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-0.5 rounded-md">{w.userTeam}</span>
                              <span className="text-[11px] font-bold text-toss-gray bg-toss-lightGray px-2 py-0.5 rounded-md">{w.userGroup}조</span>
                              {w.userPhone && <span className="text-[11px] font-bold text-toss-gray bg-toss-lightGray px-2 py-0.5 rounded-md">{w.userPhone}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center gap-3">
                        <Users size={24} className="text-toss-gray/30" />
                        <p className="text-[13px] font-bold text-toss-gray italic">아직 추첨 전입니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {draws.length === 0 && (
            <div className="py-20 text-center text-toss-gray font-bold text-sm">
              등록된 추첨이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-toss-border/40 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-toss-black">새 추첨 생성</h2>
                <p className="text-sm text-toss-gray mt-1">추첨의 제목과 대상을 설정해주세요.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={28} className="text-toss-gray" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto space-y-10 flex-1">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-toss-gray ml-1 uppercase tracking-[0.1em]">추첨 타이틀</label>
                <input
                  type="text"
                  value={newDraw.title}
                  onChange={(e) => setNewDraw((p) => ({ ...p, title: e.target.value }))}
                  placeholder="예: 🎁 에어팟 프로 2세대 (1명)"
                  className="w-full px-6 py-5 rounded-2xl border-2 border-toss-border/40 focus:border-toss-blue outline-none transition-all font-bold text-lg bg-toss-lightGray/20 placeholder:text-toss-gray/30"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-toss-gray ml-1 uppercase tracking-[0.1em]">당첨 인원</label>
                <div className="flex items-center gap-6 bg-toss-lightGray/20 p-2 rounded-3xl border-2 border-toss-border/20">
                  <button
                    onClick={() => setNewDraw((p) => ({ ...p, winnerCount: Math.max(1, p.winnerCount - 1) }))}
                    className="w-14 h-14 rounded-2xl bg-white border border-toss-border/40 flex items-center justify-center text-2xl font-bold hover:bg-toss-lightGray transition-colors shadow-sm active:scale-95"
                  >-</button>
                  <div className="flex-1 text-center">
                    <span className="font-black text-3xl text-toss-blue">{newDraw.winnerCount}</span>
                    <span className="text-sm font-bold text-toss-gray ml-1">명</span>
                  </div>
                  <button
                    onClick={() => setNewDraw((p) => ({ ...p, winnerCount: p.winnerCount + 1 }))}
                    className="w-14 h-14 rounded-2xl bg-white border border-toss-border/40 flex items-center justify-center text-2xl font-bold hover:bg-toss-lightGray transition-colors shadow-sm active:scale-95"
                  >+</button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-toss-gray ml-1 uppercase tracking-[0.1em]">대상 팀 (비우면 전체)</label>
                  <button
                    onClick={() => setNewDraw((p) => ({ ...p, targetTeams: p.targetTeams.length === TEAMS.length ? [] : [...TEAMS] }))}
                    className="text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-3 py-1 rounded-lg hover:bg-toss-blue/10 transition-colors"
                  >
                    {newDraw.targetTeams.length === TEAMS.length ? "전체 해제" : "전체 선택"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {TEAMS.map((team) => (
                    <button
                      key={team}
                      onClick={() => toggleTeam(team)}
                      className={clsx(
                        "px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all border-2",
                        newDraw.targetTeams.includes(team)
                          ? "bg-toss-blue text-white border-toss-blue shadow-md shadow-toss-blue/10"
                          : "bg-white text-toss-gray border-toss-border/40 hover:border-toss-gray/40"
                      )}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-toss-gray ml-1 uppercase tracking-[0.1em]">대상 조 (비우면 전체)</label>
                  <button
                    onClick={() => setNewDraw((p) => ({ ...p, targetGroups: p.targetGroups.length === GROUPS.length ? [] : [...GROUPS] }))}
                    className="text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-3 py-1 rounded-lg hover:bg-toss-blue/10 transition-colors"
                  >
                    {newDraw.targetGroups.length === GROUPS.length ? "전체 해제" : "전체 선택"}
                  </button>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                  {GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGroup(g)}
                      className={clsx(
                        "aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all border-2",
                        newDraw.targetGroups.includes(g)
                          ? "bg-toss-black text-white border-toss-black"
                          : "bg-white text-toss-gray border-toss-border/40 hover:border-toss-gray/40"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white border-t border-toss-border/40 flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-5 bg-toss-lightGray text-toss-gray font-black rounded-[20px] hover:bg-toss-gray/10 transition-all text-[15px] active:scale-95"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                className="flex-[2] py-5 bg-toss-blue text-white font-black rounded-[20px] shadow-xl shadow-toss-blue/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-[15px] active:scale-95"
              >
                <Save size={20} />
                추첨 이벤트 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
