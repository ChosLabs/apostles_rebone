"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, X, Loader2, Users, Lock, Eye, EyeOff, ChevronUp, ChevronDown,
  Pencil, Check, Gift, ChevronRight, UserSquare2, Maximize2, Shuffle,
  ChevronLeft, ChevronRight as ChevronRightIcon, RotateCcw,
} from "lucide-react";
import {
  subscribePolls, createPoll, updatePoll, togglePollActive, closePoll, unclosePoll, setPollVisible, deletePoll, updatePollOrder, resetPollVotes,
} from "@/lib/services/pollService";
import { createGuestLuckyDraw } from "@/lib/services/luckyDrawService";
import { GuestCandidate, Poll } from "@/types/database";

type EditForm = { question: string; description: string; options: Array<{ id: string; label: string }> };

// ── 발표용 전체화면 뷰 ────────────────────────────────────────
function PresentationView({ polls, onExit }: { polls: Poll[]; onExit: () => void }) {
  const [current, setCurrent] = useState(0);
  const poll = polls[current] ?? null;

  const getTotalVotes = (p: Poll) =>
    p.allowMultiple ? Object.keys(p.multiVotes ?? {}).length : Object.keys(p.votes ?? {}).length;

  const getVoteCount = (p: Poll, optionId: string) =>
    p.allowMultiple
      ? Object.values(p.multiVotes ?? {}).filter((arr) => arr.includes(optionId)).length
      : Object.values(p.votes ?? {}).filter((v) => v === optionId).length;

  if (!poll) return null;

  const total = getTotalVotes(poll);
  const maxCount = Math.max(0, ...poll.options.map((o) => getVoteCount(poll, o.id)));

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden select-none">
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-toss-border/40 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Maximize2 size={20} className="text-indigo-500" />
          </div>
          <span className="text-base font-bold text-toss-black">실시간 투표</span>
        </div>

        {polls.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-toss-gray px-1">
              {current + 1} / {polls.length}
            </span>
            <button
              onClick={() => setCurrent((c) => Math.min(polls.length - 1, c + 1))}
              disabled={current === polls.length - 1}
              className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
            >
              <ChevronRightIcon size={20} />
            </button>
          </div>
        )}

        <button
          onClick={onExit}
          className="p-2 rounded-xl text-toss-gray hover:bg-toss-lightGray transition-colors"
          aria-label="발표 모드 종료"
        >
          <X size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-12 lg:px-20 xl:px-32 pt-8 pb-6">
        <div className="shrink-0 mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {poll.allowMultiple && (
              <span className="inline-flex items-center gap-1.5 text-violet-600 text-xs font-bold bg-violet-50 px-3 py-1.5 rounded-lg">
                <Shuffle size={12} />중복 투표 가능
              </span>
            )}
            {!poll.isActive && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                poll.isClosed ? "bg-toss-lightGray text-toss-gray" : "bg-amber-50 text-amber-600"
              }`}>
                <Lock size={12} />
                {poll.isClosed ? "마감된 투표" : "일시 중단"}
              </span>
            )}
          </div>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-toss-black leading-tight line-clamp-3">
            {poll.question}
          </h2>
          {poll.description && (
            <p className="text-toss-gray text-base lg:text-lg mt-2 line-clamp-2">{poll.description}</p>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {poll.options.map((option) => {
            const count = getVoteCount(poll, option.id);
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            const isWinner = count > 0 && count === maxCount;

            return (
              <div key={option.id} className="flex-1 flex flex-col justify-center min-h-0">
                <div className="flex justify-between items-baseline mb-2">
                  <span className={`text-lg lg:text-xl xl:text-2xl font-black truncate mr-4 ${
                    isWinner ? "text-toss-black" : "text-toss-gray"
                  }`}>
                    {option.label}
                  </span>
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className={`text-2xl lg:text-3xl xl:text-4xl font-black tabular-nums ${
                      isWinner ? "text-indigo-600" : "text-toss-gray/50"
                    }`}>
                      {pct}%
                    </span>
                    <span className="text-sm text-toss-gray font-medium">({count}명)</span>
                  </div>
                </div>
                <div className="h-10 lg:h-12 xl:h-14 bg-toss-lightGray rounded-2xl overflow-hidden">
                  <div
                    className={`h-full rounded-2xl transition-all duration-700 ease-out ${
                      isWinner ? "bg-indigo-500" : "bg-gray-200"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 flex items-center justify-center gap-2 text-toss-gray text-sm font-bold mt-4">
          <Users size={15} />
          총 {total}명 참여
        </div>
      </div>

      {polls.length > 1 && (
        <div className="shrink-0 flex justify-center gap-2 pb-4">
          {polls.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-toss-lightGray hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminVotePage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ question: "", description: "", options: [] });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "", description: "", options: ["", ""], allowMultiple: false, isGuestOnly: false,
  });
  const [expandedVoterOptionId, setExpandedVoterOptionId] = useState<string | null>(null);
  const [creatingDrawFor, setCreatingDrawFor] = useState<string | null>(null);
  const [presentingPoll, setPresentingPoll] = useState<Poll | null>(null);

  const enterPresentation = useCallback(async (poll: Poll) => {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // 풀스크린 미지원 환경도 발표 모드는 동작
    }
    setPresentingPoll(poll);
  }, []);

  const exitPresentation = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setPresentingPoll(null);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setPresentingPoll(null);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (!presentingPoll) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitPresentation();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [presentingPoll, exitPresentation]);

  useEffect(() => {
    const unsub = subscribePolls((data) => {
      const sorted = data.map((p, i) => ({ poll: p, key: p.order ?? i * -1 }))
        .sort((a, b) => a.key - b.key)
        .map((x) => x.poll);
      setPolls(sorted);
      setLoading(false);
      setPresentingPoll((prev) => {
        if (!prev) return null;
        return data.find((p) => p.id === prev.id) ?? prev;
      });
    });
    return unsub;
  }, []);

  // ── 생성 ──────────────────────────────────────────
  const handleCreate = async () => {
    if (!newPoll.question || newPoll.options.some((o) => !o)) {
      alert("질문과 모든 선택지를 입력해주세요.");
      return;
    }
    try {
      await createPoll({
        question: newPoll.question,
        description: newPoll.description,
        options: newPoll.options.map((label, i) => ({ id: String(i + 1), label })),
        allowMultiple: newPoll.allowMultiple,
        isGuestOnly: newPoll.isGuestOnly,
      });
      setIsAdding(false);
      setNewPoll({ question: "", description: "", options: ["", ""], allowMultiple: false, isGuestOnly: false });
    } catch {
      alert("생성에 실패했습니다.");
    }
  };

  // ── 수정 ──────────────────────────────────────────
  const startEdit = (poll: Poll) => {
    setEditingId(poll.id);
    setEditForm({ question: poll.question, description: poll.description ?? "", options: poll.options.map((o) => ({ ...o })) });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.question || editForm.options.some((o) => !o.label)) {
      alert("질문과 모든 선택지를 입력해주세요.");
      return;
    }
    try {
      setIsSavingEdit(true);
      await updatePoll(editingId, { question: editForm.question, description: editForm.description, options: editForm.options });
      setEditingId(null);
    } catch {
      alert("수정에 실패했습니다.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const addEditOption = () =>
    setEditForm((f) => ({ ...f, options: [...f.options, { id: String(Date.now()), label: "" }] }));

  const removeEditOption = (idx: number) => {
    if (editForm.options.length <= 2) return;
    setEditForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  };

  // ── 상태 변경 ──────────────────────────────────────
  const handleToggleActive = async (poll: Poll) => {
    const willActivate = !poll.isActive;
    if (willActivate && polls.some((p) => p.isActive && p.id !== poll.id)) {
      alert("이미 진행 중인 투표가 있습니다. 먼저 종료해주세요.");
      return;
    }
    try {
      setProcessingId(poll.id);
      await togglePollActive(poll.id, willActivate);
    } catch {
      alert("변경에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSetVisible = async (poll: Poll) => {
    try {
      setProcessingId(poll.id);
      await setPollVisible(poll.id, !poll.isVisible);
    } catch {
      alert("변경에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleClose = async (poll: Poll) => {
    if (!confirm(`"${poll.question}" 투표를 마감하시겠습니까?\n마감 후에는 재시작할 수 없습니다.`)) return;
    try {
      setProcessingId(poll.id);
      await closePoll(poll.id);
    } catch {
      alert("마감에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnclose = async (poll: Poll) => {
    if (!confirm(`"${poll.question}" 투표의 마감을 해제하시겠습니까?`)) return;
    try {
      setProcessingId(poll.id);
      await unclosePoll(poll.id);
    } catch {
      alert("마감 해제에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 투표를 삭제하시겠습니까?")) return;
    try {
      await deletePoll(id);
      if (editingId === id) setEditingId(null);
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleResetVotes = async (poll: Poll) => {
    if (!confirm(`"${poll.question}"\n\n이 투표의 모든 투표 기록을 초기화하시겠습니까?\n참가자들의 선택이 모두 삭제됩니다.`)) return;
    try {
      setProcessingId(poll.id);
      await resetPollVotes(poll.id);
    } catch {
      alert("초기화에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleMoveOrder = async (poll: Poll, direction: "up" | "down") => {
    const idx = polls.findIndex((p) => p.id === poll.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= polls.length) return;
    const reordered = [...polls];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
    try {
      setProcessingId(poll.id);
      await Promise.all(reordered.map((p, i) => updatePollOrder(p.id, i)));
    } catch {
      alert("순서 변경에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  // ── 게스트 투표 명단 ──────────────────────────────
  const getOptionVoters = (poll: Poll, optionId: string): Array<GuestCandidate> => {
    const voterInfo = poll.guestVoterInfo ?? {};
    const voterIds = poll.allowMultiple
      ? Object.entries(poll.multiVotes ?? {}).filter(([, opts]) => opts.includes(optionId)).map(([id]) => id)
      : Object.entries(poll.votes ?? {}).filter(([, opt]) => opt === optionId).map(([id]) => id);
    return voterIds.map((guestId) => {
      const info = voterInfo[guestId];
      return info ? { guestId, ...info } : null;
    }).filter(Boolean) as GuestCandidate[];
  };

  const handleCreateDrawFromOption = async (poll: Poll, optionId: string, optionLabel: string) => {
    const candidates = getOptionVoters(poll, optionId);
    if (candidates.length === 0) { alert("해당 선택지에 투표한 게스트가 없습니다."); return; }
    const title = prompt(`추첨 제목을 입력해주세요.\n기본값: ${poll.question} - ${optionLabel}`, `${poll.question} - ${optionLabel}`);
    if (title === null) return;
    try {
      setCreatingDrawFor(optionId);
      await createGuestLuckyDraw({ title: title.trim() || `${poll.question} - ${optionLabel}`, winnerCount: 1, candidates });
      alert("추첨이 생성되었습니다. 추첨 관리 페이지에서 결과를 표출해주세요.");
      router.push("/admin/lucky-draw");
    } catch {
      alert("추첨 생성에 실패했습니다.");
    } finally {
      setCreatingDrawFor(null);
    }
  };

  // ── 집계 ───────────────────────────────────────────
  const getVoteCount = (poll: Poll, optionId: string) =>
    poll.allowMultiple
      ? Object.values(poll.multiVotes ?? {}).filter((arr) => arr.includes(optionId)).length
      : Object.values(poll.votes ?? {}).filter((v) => v === optionId).length;

  const getTotalVotes = (poll: Poll) =>
    poll.allowMultiple
      ? Object.keys(poll.multiVotes ?? {}).length
      : Object.keys(poll.votes ?? {}).length;

  const inputCls = "w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <>
      {presentingPoll && (
        <PresentationView polls={[presentingPoll]} onExit={exitPresentation} />
      )}
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">투표 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">투표를 생성하고 실시간 결과를 확인합니다.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Plus size={18} />
          투표 생성
        </button>
      </div>

      {/* 새 투표 폼 */}
      {isAdding && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-indigo-500/20 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-toss-black">새 투표 생성</h2>
            <button onClick={() => setIsAdding(false)} className="text-toss-gray"><X size={20} /></button>
          </div>
          <PollForm
            question={newPoll.question}
            description={newPoll.description}
            options={newPoll.options.map((label, i) => ({ id: String(i), label }))}
            allowMultiple={newPoll.allowMultiple}
            isGuestOnly={newPoll.isGuestOnly}
            showAllowMultiple
            showGuestOnly
            inputCls={inputCls}
            onChangeQuestion={(v) => setNewPoll((p) => ({ ...p, question: v }))}
            onChangeDescription={(v) => setNewPoll((p) => ({ ...p, description: v }))}
            onChangeOption={(idx, v) => {
              const next = [...newPoll.options];
              next[idx] = v;
              setNewPoll((p) => ({ ...p, options: next }));
            }}
            onAddOption={() => setNewPoll((p) => ({ ...p, options: [...p.options, ""] }))}
            onRemoveOption={(idx) => {
              if (newPoll.options.length <= 2) return;
              setNewPoll((p) => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));
            }}
            onToggleAllowMultiple={(v) => setNewPoll((p) => ({ ...p, allowMultiple: v }))}
            onToggleGuestOnly={(v) => setNewPoll((p) => ({ ...p, isGuestOnly: v }))}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            투표 등록하기
          </button>
        </div>
      )}

      {/* 투표 목록 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-toss-border text-center text-toss-gray font-bold text-sm">
          등록된 투표가 없습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {polls.map((poll, idx) => {
            const total = getTotalVotes(poll);
            const isProcessing = processingId === poll.id;
            const isEditing = editingId === poll.id;

            return (
              <div
                key={poll.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                  poll.isVisible
                    ? "border-l-4 border-l-emerald-500 border-y border-r border-toss-border/40"
                    : "border-toss-border/40"
                }`}
              >
                {/* 헤더 행 */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="shrink-0 text-[10px] font-black text-toss-gray/60 bg-toss-lightGray rounded px-1.5 py-0.5">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-toss-black line-clamp-2">{poll.question}</h4>
                      {poll.isVisible && (
                        <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                          <Eye size={9} />표출중
                        </span>
                      )}
                      {poll.isGuestOnly && (
                        <span className="shrink-0 text-[10px] bg-orange-50 text-orange-500 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                          <UserSquare2 size={9} />게스트 전용
                        </span>
                      )}
                      {poll.allowMultiple && (
                        <span className="shrink-0 text-[10px] bg-violet-50 text-violet-500 px-2 py-1 rounded-md font-bold">중복허용</span>
                      )}
                      {poll.isClosed ? (
                        <span className="shrink-0 text-[10px] bg-toss-lightGray text-toss-gray px-2 py-1 rounded-md font-bold flex items-center gap-1">
                          <Lock size={9} />마감
                        </span>
                      ) : poll.isActive ? (
                        <span className="shrink-0 text-[10px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md font-bold">투표중</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-toss-gray font-medium">
                      <Users size={12} />
                      <span>{total}명 참여</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(poll, "up")}
                      disabled={idx === 0 || isProcessing}
                      className="p-1.5 rounded-lg text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(poll, "down")}
                      disabled={idx === polls.length - 1 || isProcessing}
                      className="p-1.5 rounded-lg text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* 수정 폼 or 결과 바 */}
                {isEditing ? (
                  <div className="mb-4 p-4 bg-toss-lightGray/30 rounded-2xl border border-indigo-500/20">
                    <p className="text-xs font-bold text-toss-gray mb-3">투표 수정</p>
                    <PollForm
                      question={editForm.question}
                      description={editForm.description}
                      options={editForm.options}
                      inputCls={inputCls}
                      onChangeQuestion={(v) => setEditForm((f) => ({ ...f, question: v }))}
                      onChangeDescription={(v) => setEditForm((f) => ({ ...f, description: v }))}
                      onChangeOption={(i, v) =>
                        setEditForm((f) => {
                          const opts = [...f.options];
                          opts[i] = { ...opts[i], label: v };
                          return { ...f, options: opts };
                        })
                      }
                      onAddOption={addEditOption}
                      onRemoveOption={removeEditOption}
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-500 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                      >
                        {isSavingEdit ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 bg-toss-lightGray text-toss-gray text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-5">
                    {poll.options.map((opt) => {
                      const count = getVoteCount(poll, opt.id);
                      const pct = total === 0 ? 0 : Math.round((count / total) * 100);
                      const voters = poll.isGuestOnly && poll.isClosed ? getOptionVoters(poll, opt.id) : [];
                      const isExpanded = expandedVoterOptionId === `${poll.id}-${opt.id}`;

                      return (
                        <div key={opt.id}>
                          <div className="relative overflow-hidden rounded-xl border border-toss-border/40 bg-toss-lightGray/20">
                            <div className="absolute inset-0 bg-indigo-50 transition-all duration-500" style={{ width: `${pct}%` }} />
                            <div className="relative z-10 px-4 py-2.5 flex justify-between items-center">
                              <span className="text-sm font-bold text-toss-black">{opt.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-indigo-600">
                                  {pct}% <span className="text-xs font-medium text-toss-gray">({count})</span>
                                </span>
                                {poll.isGuestOnly && poll.isClosed && voters.length > 0 && (
                                  <button
                                    onClick={() => setExpandedVoterOptionId(isExpanded ? null : `${poll.id}-${opt.id}`)}
                                    className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-orange-100 transition-colors"
                                  >
                                    명단 {isExpanded ? "접기" : "보기"}
                                    <ChevronRight size={10} className={isExpanded ? "rotate-90 transition-transform" : "transition-transform"} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* 게스트 투표자 명단 */}
                          {poll.isGuestOnly && poll.isClosed && isExpanded && (
                            <div className="mt-1 p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] font-bold text-orange-700">{opt.label} 선택 명단 ({voters.length}명)</p>
                                <button
                                  onClick={() => handleCreateDrawFromOption(poll, opt.id, opt.label)}
                                  disabled={creatingDrawFor === opt.id}
                                  className="flex items-center gap-1 text-[10px] font-bold text-toss-blue bg-toss-blue/10 px-2.5 py-1.5 rounded-lg hover:bg-toss-blue/20 transition-colors disabled:opacity-50"
                                >
                                  {creatingDrawFor === opt.id ? <Loader2 size={10} className="animate-spin" /> : <Gift size={10} />}
                                  추첨 생성
                                </button>
                              </div>
                              <div className="flex flex-col gap-1">
                                {voters.map((v, i) => (
                                  <div key={i} className="flex items-center gap-2 text-[12px] text-toss-black py-1.5 border-b border-orange-100/60 last:border-0">
                                    <span className="font-bold">{v.name}</span>
                                    <span className="text-toss-gray text-[11px]">{v.team}</span>
                                    <span className="text-toss-gray text-[11px]">{v.phone}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 액션 버튼 행 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetVisible(poll)}
                    disabled={isProcessing}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                      poll.isVisible
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "bg-toss-lightGray text-toss-gray hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={13} /> : poll.isVisible ? <><Eye size={13} />표출중</> : <><EyeOff size={13} />표출</>}
                  </button>

                  {poll.isClosed ? (
                    <button
                      onClick={() => handleUnclose(poll)}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-toss-lightGray text-toss-gray hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={12} /> : <Lock size={12} />}
                      마감 해제
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleActive(poll)}
                        disabled={isProcessing}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                          poll.isActive
                            ? "bg-toss-lightGray text-toss-gray hover:bg-orange-50 hover:text-orange-500"
                            : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                        }`}
                      >
                        {isProcessing ? <Loader2 className="animate-spin mx-auto" size={14} /> : poll.isActive ? "투표 종료" : "투표 시작"}
                      </button>
                      <button
                        onClick={() => handleClose(poll)}
                        disabled={isProcessing}
                        className="px-3 py-2.5 text-xs font-bold rounded-lg bg-toss-lightGray text-toss-gray hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Lock size={12} />마감
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => enterPresentation(poll)}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg bg-toss-lightGray text-toss-gray hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <Maximize2 size={13} />
                    발표
                  </button>

                  <button
                    onClick={() => isEditing ? setEditingId(null) : startEdit(poll)}
                    className={`p-2.5 rounded-lg transition-colors ${
                      isEditing ? "bg-indigo-100 text-indigo-500" : "text-toss-gray hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleResetVotes(poll)}
                    disabled={isProcessing || getTotalVotes(poll) === 0}
                    title="투표 기록 초기화"
                    className="p-2.5 text-toss-gray hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(poll.id)}
                    className="p-2.5 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

// ── 공용 폼 컴포넌트 ────────────────────────────────────────
function PollForm({
  question, description, options, allowMultiple, isGuestOnly, showAllowMultiple, showGuestOnly, inputCls,
  onChangeQuestion, onChangeDescription, onChangeOption, onAddOption, onRemoveOption,
  onToggleAllowMultiple, onToggleGuestOnly,
}: {
  question: string;
  description: string;
  options: Array<{ id: string; label: string }>;
  allowMultiple?: boolean;
  isGuestOnly?: boolean;
  showAllowMultiple?: boolean;
  showGuestOnly?: boolean;
  inputCls: string;
  onChangeQuestion: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeOption: (idx: number, v: string) => void;
  onAddOption: () => void;
  onRemoveOption: (idx: number) => void;
  onToggleAllowMultiple?: (v: boolean) => void;
  onToggleGuestOnly?: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-bold text-toss-gray mb-1.5 block">투표 질문</label>
        <input
          type="text"
          value={question}
          onChange={(e) => onChangeQuestion(e.target.value)}
          className={`${inputCls} font-bold`}
          placeholder="예: 가장 기대되는 프로그램은?"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-toss-gray mb-1.5 block">설명 (선택)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className={inputCls}
          placeholder="투표 설명을 입력하세요"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-toss-gray mb-2 block">선택지</label>
        <div className="flex flex-col gap-2">
          {options.map((opt, idx) => (
            <div key={opt.id} className="flex gap-2">
              <input
                type="text"
                value={opt.label}
                onChange={(e) => onChangeOption(idx, e.target.value)}
                className="flex-1 bg-white border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder={`옵션 ${idx + 1}`}
              />
              {options.length > 2 && (
                <button onClick={() => onRemoveOption(idx)} className="p-3 text-toss-gray hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={onAddOption}
          className="mt-3 text-indigo-500 text-xs font-bold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <Plus size={14} /> 선택지 추가
        </button>
      </div>
      {showAllowMultiple && onToggleAllowMultiple && (
        <label className="flex items-center gap-3 px-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!allowMultiple}
            onChange={(e) => onToggleAllowMultiple(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-500"
          />
          <span className="text-sm font-bold text-toss-black">중복 투표 허용</span>
          <span className="text-xs text-toss-gray">(복수 선택 가능)</span>
        </label>
      )}
      {showGuestOnly && onToggleGuestOnly && (
        <label className="flex items-center gap-3 px-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!isGuestOnly}
            onChange={(e) => onToggleGuestOnly(e.target.checked)}
            className="w-4 h-4 rounded accent-orange-500"
          />
          <span className="text-sm font-bold text-toss-black">게스트 전용 투표</span>
          <span className="text-xs text-toss-gray">(일반 참가자는 투표 불가)</span>
        </label>
      )}
    </div>
  );
}
