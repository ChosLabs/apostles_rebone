"use client";

import { useState } from "react";
import { Vote, ArrowLeft, Check, Users } from "lucide-react";
import Link from "next/link";

interface PollOption {
  id: number;
  label: string;
  votes: number;
}

const MOCK_POLL = {
  id: 1,
  question: "가장 기대되는 수련회 프로그램은 무엇인가요?",
  description: "여러분의 소중한 한 표를 행사해주세요! 결과는 실시간으로 반영됩니다.",
  options: [
    { id: 1, label: "개회예배 및 찬양", votes: 124 },
    { id: 2, label: "조별 GBS 시간", votes: 85 },
    { id: 3, label: "저녁 집회", votes: 210 },
    { id: 4, label: "야외 액티비티", votes: 156 },
  ]
};

export default function VotePage() {
  const [votedId, setVotedId] = useState<number | null>(null);
  const [poll, setPoll] = useState(MOCK_POLL);

  const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0) + (votedId ? 0 : 0); // Logic simplified for mock

  const handleVote = (id: number) => {
    if (votedId) return;
    setVotedId(id);
    // Simulate updating votes
    setPoll({
      ...poll,
      options: poll.options.map(opt => opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt)
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">실시간 투표</h1>
      </header>

      <main className="p-4 flex flex-col gap-6">
        <div className="bg-white rounded-toss p-6 shadow-sm border border-toss-border/40">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
            <Vote size={28} />
          </div>
          <h2 className="text-xl font-bold text-toss-black mb-2">{poll.question}</h2>
          <p className="text-sm text-toss-gray leading-relaxed mb-6">
            {poll.description}
          </p>

          <div className="flex flex-col gap-3">
            {poll.options.map((option) => {
              const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
              const isWinner = votedId && option.votes === Math.max(...poll.options.map(o => o.votes));

              return (
                <button
                  key={option.id}
                  disabled={votedId !== null}
                  onClick={() => handleVote(option.id)}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all group ${
                    votedId === option.id 
                    ? "border-toss-blue bg-toss-blue/5" 
                    : votedId !== null 
                      ? "border-toss-border/40 bg-white opacity-80" 
                      : "border-toss-border/40 bg-white hover:border-toss-blue/40"
                  }`}
                >
                  {/* Progress Bar Background */}
                  {votedId !== null && (
                    <div 
                      className={`absolute inset-0 transition-all duration-1000 ease-out ${isWinner ? 'bg-toss-blue/10' : 'bg-toss-lightGray/50'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  <div className="relative z-10 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {votedId === option.id && <Check size={18} className="text-toss-blue shrink-0" />}
                      <span className={`text-[15px] font-bold ${votedId === option.id ? 'text-toss-blue' : 'text-toss-black'}`}>
                        {option.label}
                      </span>
                    </div>
                    {votedId !== null && (
                      <span className={`text-sm font-bold ${votedId === option.id ? 'text-toss-blue' : 'text-toss-gray'}`}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {votedId && (
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-toss-gray font-medium animate-in fade-in zoom-in-95 duration-500">
              <Users size={14} />
              현재 {totalVotes}명이 참여했습니다
            </div>
          )}
        </div>

        {!votedId && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-toss-blue/10 flex items-start gap-3">
            <div className="bg-toss-blue/10 p-1.5 rounded-lg text-toss-blue mt-0.5">
              <Check size={14} />
            </div>
            <p className="text-[13px] text-toss-blue/80 leading-relaxed font-medium">
              투표는 1인 1회만 가능하며, 투표 후에는 수정이 불가능합니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
