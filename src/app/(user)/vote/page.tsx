"use client";

import { useState, useEffect, useCallback } from "react";
import { Vote, ArrowLeft, Check, Users, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeActivePoll, castVote } from "@/lib/services/pollService";
import { Poll } from "@/types/database";

export default function VotePage() {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [subKey, setSubKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeActivePoll(
      (p) => {
        setPoll(p);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [subKey]);

  const myVote = user && poll ? poll.votes?.[user.uid] ?? null : null;
  const totalVotes = poll ? Object.keys(poll.votes ?? {}).length : 0;

  const getVoteCount = (optionId: string) =>
    poll ? Object.values(poll.votes ?? {}).filter((v) => v === optionId).length : 0;

  const handleVote = async (optionId: string) => {
    if (!user || !poll || myVote || isVoting) return;
    try {
      setIsVoting(true);
      await castVote(poll.id, user.uid, optionId);
    } catch (e) {
      console.error(e);
      alert("투표 처리 중 오류가 발생했습니다.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black flex-1">실시간 투표</h1>
        <button
          onClick={() => setSubKey((k) => k + 1)}
          className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray"
          aria-label="새로고침"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <main className="p-4 flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-toss-blue" size={32} />
          </div>
        ) : !poll ? (
          <div className="bg-white rounded-toss p-12 shadow-sm border border-toss-border/40 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Vote size={32} className="text-indigo-400" />
            </div>
            <p className="text-base font-bold text-toss-black">진행 중인 투표가 없습니다</p>
            <p className="text-sm text-toss-gray">운영진이 투표를 시작하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-toss p-6 shadow-sm border border-toss-border/40">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                <Vote size={28} />
              </div>
              <h2 className="text-xl font-bold text-toss-black mb-2">{poll.question}</h2>
              {poll.description && (
                <p className="text-sm text-toss-gray leading-relaxed mb-6">{poll.description}</p>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {poll.options.map((option) => {
                  const count = getVoteCount(option.id);
                  const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  const isMyVote = myVote === option.id;
                  const isWinner =
                    !!myVote &&
                    count === Math.max(...poll.options.map((o) => getVoteCount(o.id)));

                  return (
                    <button
                      key={option.id}
                      disabled={!!myVote || isVoting}
                      onClick={() => handleVote(option.id)}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all group ${
                        isMyVote
                          ? "border-toss-blue bg-toss-blue/5"
                          : myVote
                          ? "border-toss-border/40 bg-white opacity-80"
                          : "border-toss-border/40 bg-white hover:border-toss-blue/40"
                      }`}
                    >
                      {myVote && (
                        <div
                          className={`absolute inset-0 transition-all duration-1000 ease-out ${
                            isWinner ? "bg-toss-blue/10" : "bg-toss-lightGray/50"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative z-10 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {isMyVote && <Check size={18} className="text-toss-blue shrink-0" />}
                          <span
                            className={`text-[15px] font-bold ${
                              isMyVote ? "text-toss-blue" : "text-toss-black"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                        {myVote && (
                          <span
                            className={`text-sm font-bold ${
                              isMyVote ? "text-toss-blue" : "text-toss-gray"
                            }`}
                          >
                            {percentage}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {myVote && (
                <div className="flex items-center justify-center gap-2 text-xs text-toss-gray font-medium animate-in fade-in zoom-in-95 duration-500">
                  <Users size={14} />
                  현재 {totalVotes}명이 참여했습니다
                </div>
              )}
            </div>

            {!myVote && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-toss-blue/10 flex items-start gap-3">
                <div className="bg-toss-blue/10 p-1.5 rounded-lg text-toss-blue mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-[13px] text-toss-blue/80 leading-relaxed font-medium">
                  투표는 1인 1회만 가능하며, 투표 후에는 수정이 불가능합니다.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
