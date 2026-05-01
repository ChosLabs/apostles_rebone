"use client";

import { useState } from "react";
import { Vote, Plus, Trash2, X, ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";

interface PollOption {
  id: number;
  label: string;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  active: boolean;
}

const INITIAL_POLLS: Poll[] = [
  { 
    id: 1, 
    question: "가장 기대되는 수련회 프로그램은 무엇인가요?", 
    active: true,
    options: [
      { id: 1, label: "개회예배 및 찬양" },
      { id: 2, label: "조별 GBS 시간" },
    ]
  }
];

export default function AdminVotePage() {
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [isAdding, setIsAdding] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  });

  const handleAddOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const handleRemoveOption = (index: number) => {
    if (newPoll.options.length <= 2) return;
    const nextOptions = [...newPoll.options];
    nextOptions.splice(index, 1);
    setNewPoll({ ...newPoll, options: nextOptions });
  };

  const handleCreatePoll = () => {
    if (!newPoll.question || newPoll.options.some(opt => !opt)) return;
    const poll: Poll = {
      id: Date.now(),
      question: newPoll.question,
      active: false,
      options: newPoll.options.map((opt, i) => ({ id: i + 1, label: opt }))
    };
    setPolls([poll, ...polls]);
    setIsAdding(false);
    setNewPoll({ question: "", options: ["", ""] });
  };

  return (
    <div className="flex flex-col min-h-screen bg-toss-lightGray/30 pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center justify-between border-b border-toss-border/40">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
            <ArrowLeft size={24} className="text-toss-black" />
          </Link>
          <h1 className="text-lg font-bold text-toss-black">투표 관리</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} />
          투표 생성
        </button>
      </header>

      <main className="p-4 flex flex-col gap-6">
        {isAdding && (
          <div className="bg-white rounded-toss p-6 shadow-md border-2 border-indigo-500/20 animate-in slide-in-from-top duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-toss-black">새 투표 생성</h2>
              <button onClick={() => setIsAdding(false)} className="text-toss-gray"><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-toss-gray mb-1.5 block">투표 질문</label>
                <input 
                  type="text" 
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                  className="w-full bg-toss-lightGray/50 border border-toss-border/40 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="예: 오늘 점심 어떠셨나요?"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-toss-gray mb-2 block">선택지</label>
                <div className="flex flex-col gap-2">
                  {newPoll.options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={option}
                        onChange={(e) => {
                          const nextOpts = [...newPoll.options];
                          nextOpts[idx] = e.target.value;
                          setNewPoll({...newPoll, options: nextOpts});
                        }}
                        className="flex-1 bg-white border border-toss-border/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        placeholder={`옵션 ${idx + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button 
                          onClick={() => handleRemoveOption(idx)}
                          className="p-3 text-toss-gray hover:text-red-500 transition-colors"
                        >
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
                onClick={handleCreatePoll}
                className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
              >
                투표 시작하기
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">진행 중인 투표</h3>
          {polls.filter(p => p.active).map(poll => (
            <div key={poll.id} className="bg-white rounded-toss p-5 shadow-sm border-l-4 border-l-indigo-500 border-y border-r border-toss-border/40">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-toss-black">{poll.question}</h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md font-bold">진행중</span>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                {poll.options.map(opt => (
                  <div key={opt.id} className="text-xs text-toss-gray flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-toss-lightGray rounded-full"></div>
                    {opt.label}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-toss-lightGray text-toss-gray text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">투표 종료</button>
                <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-500 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5">
                  <BarChart3 size={14} /> 결과 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
