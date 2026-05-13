"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, Loader2, Users, Lock, Eye, EyeOff, ChevronUp, ChevronDown, Pencil, Check } from "lucide-react";
import { subscribePolls, createPoll, updatePoll, togglePollActive, closePoll, setPollVisible, deletePoll, updatePollOrder } from "@/lib/services/pollService";
import { Poll } from "@/types/database";

type EditForm = { question: string; description: string; options: Array<{ id: string; label: string }> };

export default function AdminVotePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ question: "", description: "", options: [] });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: "", description: "", options: ["", ""], allowMultiple: false });

  useEffect(() => {
    const unsub = subscribePolls((data) => {
      // 정렬: order 있으면 우선, 없으면 Firestore 반환 순서(createdAt desc) 기반 인덱스로 fallback
      const sorted = data.map((p, i) => ({ poll: p, key: p.order ?? i * -1 }))
        .sort((a, b) => a.key - b.key)
        .map((x) => x.poll);
      setPolls(sorted);
      setLoading(false);
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
      });
      setIsAdding(false);
      setNewPoll({ question: "", description: "", options: ["", ""], allowMultiple: false });
    } catch {
      alert("생성에 실패했습니다.");
    }
  };

  // ── 수정 ──────────────────────────────────────────
  const startEdit = (poll: Poll) => {
    setEditingId(poll.id);
    setEditForm({
      question: poll.question,
      description: poll.description ?? "",
      options: poll.options.map((o) => ({ ...o })),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.question || editForm.options.some((o) => !o.label)) {
      alert("질문과 모든 선택지를 입력해주세요.");
      return;
    }
    try {
      setIsSavingEdit(true);
      await updatePoll(editingId, {
        question: editForm.question,
        description: editForm.description,
        options: editForm.options,
      });
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

  const handleDelete = async (id: string) => {
    if (!confirm("이 투표를 삭제하시겠습니까?")) return;
    try {
      await deletePoll(id);
      if (editingId === id) setEditingId(null);
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  // ── 순서 조정: 이동 시 전체 인덱스를 정규화 ──────────
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

  // ── 집계 ───────────────────────────────────────────
  const getVoteCount = (poll: Poll, optionId: string) =>
    poll.allowMultiple
      ? Object.values(poll.multiVotes ?? {}).filter((arr) => arr.includes(optionId)).length
      : Object.values(poll.votes ?? {}).filter((v) => v === optionId).length;

  const getTotalVotes = (poll: Poll) =>
    poll.allowMultiple
      ? Object.keys(poll.multiVotes ?? {}).length
      : Object.keys(poll.votes ?? {}).length;

  // ── 공용 인풋 스타일 ───────────────────────────────
  const inputCls = "w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors";

  return (
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
            showAllowMultiple
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

                  {/* 순서 조정 버튼 */}
                  <div className="flex flex-col gap-1 ml-2 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(poll, "up")}
                      disabled={idx === 0 || isProcessing}
                      className="p-1.5 rounded-lg text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
                      aria-label="위로"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(poll, "down")}
                      disabled={idx === polls.length - 1 || isProcessing}
                      className="p-1.5 rounded-lg text-toss-gray hover:bg-toss-lightGray disabled:opacity-20 transition-colors"
                      aria-label="아래로"
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
                      return (
                        <div key={opt.id} className="relative overflow-hidden rounded-xl border border-toss-border/40 bg-toss-lightGray/20">
                          <div
                            className="absolute inset-0 bg-indigo-50 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative z-10 px-4 py-2.5 flex justify-between items-center">
                            <span className="text-sm font-bold text-toss-black">{opt.label}</span>
                            <span className="text-sm font-black text-indigo-600">
                              {pct}% <span className="text-xs font-medium text-toss-gray">({count})</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 액션 버튼 행 */}
                <div className="flex gap-2">
                  {/* 표출 토글 */}
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

                  {/* 시작/종료 or 마감됨 */}
                  {poll.isClosed ? (
                    <div className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-toss-lightGray text-toss-gray text-center flex items-center justify-center gap-1.5">
                      <Lock size={12} />마감됨
                    </div>
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

                  {/* 수정 */}
                  <button
                    onClick={() => isEditing ? setEditingId(null) : startEdit(poll)}
                    className={`p-2.5 rounded-lg transition-colors ${
                      isEditing
                        ? "bg-indigo-100 text-indigo-500"
                        : "text-toss-gray hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                    aria-label="수정"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* 삭제 */}
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
  );
}

// ── 공용 폼 컴포넌트 ────────────────────────────────────────
function PollForm({
  question, description, options, allowMultiple, showAllowMultiple, inputCls,
  onChangeQuestion, onChangeDescription, onChangeOption, onAddOption, onRemoveOption, onToggleAllowMultiple,
}: {
  question: string;
  description: string;
  options: Array<{ id: string; label: string }>;
  allowMultiple?: boolean;
  showAllowMultiple?: boolean;
  inputCls: string;
  onChangeQuestion: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeOption: (idx: number, v: string) => void;
  onAddOption: () => void;
  onRemoveOption: (idx: number) => void;
  onToggleAllowMultiple?: (v: boolean) => void;
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
    </div>
  );
}
