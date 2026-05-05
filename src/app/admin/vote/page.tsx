"use client";

import { useState, useEffect } from "react";
import { Vote, Plus, Trash2, X, BarChart3, Loader2, Users } from "lucide-react";
import { subscribePolls, createPoll, togglePollActive, deletePoll } from "@/lib/services/pollService";
import { Poll } from "@/types/database";

export default function AdminVotePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [newPoll, setNewPoll] = useState({ question: "", description: "", options: ["", ""] });

  useEffect(() => {
    const unsub = subscribePolls((data) => {
      setPolls(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAddOption = () =>
    setNewPoll((p) => ({ ...p, options: [...p.options, ""] }));

  const handleRemoveOption = (idx: number) => {
    if (newPoll.options.length <= 2) return;
    setNewPoll((p) => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));
  };

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
      });
      setIsAdding(false);
      setNewPoll({ question: "", description: "", options: ["", ""] });
    } catch (e) {
      alert("생성에 실패했습니다.");
    }
  };

  const handleToggleActive = async (poll: Poll) => {
    const willActivate = !poll.isActive;
    if (willActivate && polls.some((p) => p.isActive && p.id !== poll.id)) {
      alert("이미 진행 중인 투표가 있습니다. 먼저 종료해주세요.");
      return;
    }
    try {
      setProcessingId(poll.id);
      await togglePollActive(poll.id, willActivate);
    } catch (e) {
      alert("변경에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 투표를 삭제하시겠습니까?")) return;
    try {
      await deletePoll(id);
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  const getVoteCount = (poll: Poll, optionId: string) =>
    Object.values(poll.votes ?? {}).filter((v) => v === optionId).length;

  const getTotalVotes = (poll: Poll) => Object.keys(poll.votes ?? {}).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">투표 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">투표를 생성하고 실시간 결과를 확인합니다.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
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
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-toss-gray mb-1.5 block">투표 질문</label>
              <input
                type="text"
                value={newPoll.question}
                onChange={(e) => setNewPoll((p) => ({ ...p, question: e.target.value }))}
                className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="예: 가장 기대되는 프로그램은?"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-toss-gray mb-1.5 block">설명 (선택)</label>
              <input
                type="text"
                value={newPoll.description}
                onChange={(e) => setNewPoll((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="투표 설명을 입력하세요"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-toss-gray mb-2 block">선택지</label>
              <div className="flex flex-col gap-2">
                {newPoll.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...newPoll.options];
                        next[idx] = e.target.value;
                        setNewPoll((p) => ({ ...p, options: next }));
                      }}
                      className="flex-1 bg-white border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder={`옵션 ${idx + 1}`}
                    />
                    {newPoll.options.length > 2 && (
                      <button onClick={() => handleRemoveOption(idx)} className="p-3 text-toss-gray hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddOption}
                className="mt-3 text-indigo-500 text-xs font-bold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              >
                <Plus size={14} /> 선택지 추가
              </button>
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              투표 등록하기
            </button>
          </div>
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
          {polls.map((poll) => {
            const total = getTotalVotes(poll);
            const isProcessing = processingId === poll.id;

            return (
              <div
                key={poll.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${
                  poll.isActive ? "border-l-4 border-l-indigo-500 border-y border-r border-toss-border/40" : "border-toss-border/40"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-toss-black line-clamp-2">{poll.question}</h4>
                      {poll.isActive && (
                        <span className="shrink-0 text-[10px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md font-bold">진행중</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-toss-gray font-medium">
                      <Users size={12} />
                      <span>{total}명 참여</span>
                    </div>
                  </div>
                </div>

                {/* 선택지 + 결과 */}
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
                          <span className="text-sm font-black text-indigo-600">{pct}% <span className="text-xs font-medium text-toss-gray">({count})</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(poll)}
                    disabled={isProcessing}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                      poll.isActive
                        ? "bg-toss-lightGray text-toss-gray hover:bg-red-50 hover:text-red-500"
                        : "bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin mx-auto" size={14} />
                    ) : poll.isActive ? (
                      "투표 종료"
                    ) : (
                      "투표 시작"
                    )}
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
  );
}
