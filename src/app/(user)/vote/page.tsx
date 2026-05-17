"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Vote, ArrowLeft, Check, Users, Loader2, RefreshCw, Lock, Shuffle,
  X, ChevronLeft, ChevronRight, UserSquare2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeVisiblePolls, castVote, castMultiVote, fetchUserVote } from "@/lib/services/pollService";
import { Poll, UserVote } from "@/types/database";

// ── 발표용 전체화면 뷰 ────────────────────────────────────────
function PresentationView({ polls, onExit }: { polls: Poll[]; onExit: () => void }) {
  const [current, setCurrent] = useState(0);
  const poll = polls[current] ?? null;

  const getTotalVotes = (p: Poll) => p.totalVoters ?? 0;
  const getVoteCount = (p: Poll, optionId: string) => p.voteCounts?.[optionId] ?? 0;

  if (!poll) return null;

  const total = getTotalVotes(poll);
  const maxCount = Math.max(0, ...poll.options.map((o) => getVoteCount(poll, o.id)));

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden select-none">

      {/* 헤더 — 앱 헤더 스타일과 동일 */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-toss-border/40 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Vote size={20} className="text-indigo-500" />
          </div>
          <span className="text-base font-bold text-toss-black">실시간 투표</span>
        </div>

        {/* 다수 투표일 때 페이지네이션 */}
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
              <ChevronRight size={20} />
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

      {/* 콘텐츠 — flex-1로 남은 높이 전부 사용, 절대 스크롤 없음 */}
      <div className="flex-1 flex flex-col overflow-hidden px-12 lg:px-20 xl:px-32 pt-8 pb-6">

        {/* 질문 영역 */}
        <div className="shrink-0 mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {poll.allowMultiple && (
              <span className="inline-flex items-center gap-1.5 text-violet-600 text-xs font-bold bg-violet-50 px-3 py-1.5 rounded-lg">
                <Shuffle size={12} />중복 투표 가능
              </span>
            )}
            {!poll.isActive && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                poll.isClosed
                  ? "bg-toss-lightGray text-toss-gray"
                  : "bg-amber-50 text-amber-600"
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

        {/* 선택지 — flex-1로 남은 공간 균등 분할 */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {poll.options.map((option) => {
            const count = getVoteCount(poll, option.id);
            const pct = total === 0 ? 0 : Math.round((count / total) * 100);
            const isWinner = count > 0 && count === maxCount;

            return (
              <div key={option.id} className="flex-1 flex flex-col justify-center min-h-0">
                {/* 라벨 + 수치 행 */}
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
                {/* 바 */}
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

        {/* 참여자 수 */}
        <div className="shrink-0 flex items-center justify-center gap-2 text-toss-gray text-sm font-bold mt-4">
          <Users size={15} />
          총 {total}명 참여
        </div>
      </div>

      {/* 하단 페이지 인디케이터 (다수일 때) */}
      {polls.length > 1 && (
        <div className="shrink-0 flex justify-center gap-2 pb-4">
          {polls.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-6 h-2 bg-indigo-500"
                  : "w-2 h-2 bg-toss-lightGray hover:bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 유저용 투표 카드 ─────────────────────────────────────────
function PollCard({
  poll, userVote, isGuest, votingPollId, onSingleVote, onMultiVote,
}: {
  poll: Poll;
  userVote: UserVote | null;
  isGuest: boolean;
  votingPollId: string | null;
  onSingleVote: (poll: Poll, optionId: string) => void;
  onMultiVote: (poll: Poll, optionId: string) => void;
}) {
  // 게스트 전용 투표 — 비게스트 차단
  if (poll.isGuestOnly && !isGuest) {
    return (
      <div className="bg-white dark:bg-surface rounded-toss p-6 shadow-sm border border-toss-border/40">
        <div className="w-12 h-12 bg-orange-50 text-orange-400 rounded-2xl flex items-center justify-center mb-4">
          <UserSquare2 size={26} />
        </div>
        <h2 className="text-xl font-bold text-toss-black mb-1">{poll.question}</h2>
        {poll.description && <p className="text-sm text-toss-gray mb-3">{poll.description}</p>}
        <p className="text-sm font-bold text-orange-500 bg-orange-50 px-4 py-3 rounded-xl">
          게스트 모드에서만 투표할 수 있는 기능입니다.
        </p>
      </div>
    );
  }

  // 여기 도달 시: 일반 투표 또는 (게스트 전용 + 게스트 유저)
  const canVote = !!poll.isActive && !poll.isClosed;
  const isVoting = votingPollId === poll.id;

  const myVote = !poll.allowMultiple ? (userVote?.optionId ?? null) : null;
  const myMultiVotes: string[] = poll.allowMultiple ? (userVote?.optionIds ?? []) : [];
  const hasVoted = poll.allowMultiple ? myMultiVotes.length > 0 : !!myVote;

  const totalVotes = poll.totalVoters ?? 0;
  const getVoteCount = (optionId: string) => poll.voteCounts?.[optionId] ?? 0;
  const maxCount = Math.max(0, ...poll.options.map((o) => getVoteCount(o.id)));

  return (
    <div className="bg-white dark:bg-surface rounded-toss p-6 shadow-sm border border-toss-border/40">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
        <Vote size={28} />
      </div>
      <h2 className="text-xl font-bold text-toss-black mb-2">{poll.question}</h2>
      {poll.description && (
        <p className="text-sm text-toss-gray leading-relaxed mb-4">{poll.description}</p>
      )}

      {poll.allowMultiple && (
        <div className="mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-violet-50 text-violet-600">
          <Shuffle size={12} />
          중복 투표 가능 — 여러 항목을 선택할 수 있습니다
        </div>
      )}

      {!canVote && (
        <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
          poll.isClosed ? "bg-toss-lightGray text-toss-gray" : "bg-amber-50 text-amber-600"
        }`}>
          {poll.isClosed ? <Lock size={12} /> : <RefreshCw size={12} />}
          {poll.isClosed ? "마감된 투표입니다" : "투표가 일시 중단되었습니다"}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-5">
        {poll.options.map((option) => {
          const count = getVoteCount(option.id);
          const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
          const isMyVote = poll.allowMultiple ? myMultiVotes.includes(option.id) : myVote === option.id;
          const isWinner = count > 0 && count === maxCount;
          const isClickable = canVote && !isVoting;

          return (
            <button
              key={option.id}
              disabled={!isClickable}
              onClick={() => poll.allowMultiple ? onMultiVote(poll, option.id) : onSingleVote(poll, option.id)}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                isMyVote
                  ? "border-toss-blue bg-toss-blue/5"
                  : isClickable
                  ? "border-toss-border/40 bg-white dark:bg-surface hover:border-toss-blue/40"
                  : "border-toss-border/40 bg-white dark:bg-surface opacity-70"
              }`}
            >
              <div
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isWinner ? "bg-toss-blue/10" : "bg-toss-lightGray/50"
                }`}
                style={{ width: `${percentage}%` }}
              />
              <div className="relative z-10 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {isMyVote && <Check size={18} className="text-toss-blue shrink-0" />}
                  <span className={`text-[15px] font-bold ${isMyVote ? "text-toss-blue" : "text-toss-black"}`}>
                    {option.label}
                  </span>
                </div>
                <span className={`text-sm font-bold ${isMyVote ? "text-toss-blue" : "text-toss-gray"}`}>
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-toss-gray font-medium mb-4">
        <Users size={14} />
        현재 {totalVotes}명이 참여했습니다
      </div>

      {canVote && (
        <div className="bg-blue-50/50 p-3 rounded-xl border border-toss-blue/10 flex items-center gap-2.5">
          <div className="bg-toss-blue/10 p-1.5 rounded-lg text-toss-blue shrink-0">
            <Check size={13} />
          </div>
          <p className="text-[12px] text-toss-blue/80 leading-relaxed font-medium">
            {poll.allowMultiple
              ? "중복 투표가 가능합니다. 항목을 눌러 선택하거나 취소할 수 있습니다."
              : hasVoted
              ? "이미 투표하셨습니다. 다른 항목을 눌러 투표를 변경할 수 있습니다."
              : "투표 후에도 변경이 가능합니다."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function VotePage() {
  const { user, isGuest } = useAuth();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote | null>>({});
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [subKey, setSubKey] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPollsRef = useRef<Poll[]>([]);
  const fetchedPollIdsRef = useRef<Set<string>>(new Set());

  // 투표 목록 구독 (debounce 적용)
  useEffect(() => {
    setLoading(true);
    let isFirst = true;
    const unsub = subscribeVisiblePolls((p) => {
      latestPollsRef.current = p;
      if (isFirst) {
        isFirst = false;
        setPolls(p);
        setLoading(false);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPolls(latestPollsRef.current);
      }, 200);
    });
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [subKey]);

  // subKey 변경 시 유저 투표 캐시 초기화
  useEffect(() => {
    fetchedPollIdsRef.current = new Set();
    setUserVotes({});
  }, [subKey]);

  // 새로운 투표가 생길 때마다 해당 유저의 응답을 서브컬렉션에서 1회 조회
  useEffect(() => {
    if (!user?.uid || !polls.length) return;
    const uid = user.uid;
    const toFetch = polls.filter((p) => !fetchedPollIdsRef.current.has(p.id));
    if (!toFetch.length) return;
    toFetch.forEach((p) => fetchedPollIdsRef.current.add(p.id));
    Promise.all(toFetch.map((p) => fetchUserVote(p.id, uid))).then((results) => {
      setUserVotes((prev) => {
        const next = { ...prev };
        toFetch.forEach((p, i) => { next[p.id] = results[i]; });
        return next;
      });
    });
  }, [polls, user?.uid]);

  const exitPresentation = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsPresenting(false);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsPresenting(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    if (!isPresenting) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitPresentation();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isPresenting, exitPresentation]);

  const guestVoterInfo = isGuest && user
    ? { name: user.name, team: user.team ?? "", phone: user.phone ?? "" }
    : undefined;

  const handleSingleVote = async (poll: Poll, optionId: string) => {
    if (!user || votingPollId) return;
    const prevVote = userVotes[poll.id];
    const prevOptionId = prevVote?.optionId ?? null;
    if (prevOptionId === optionId) return;

    // 낙관적 업데이트: userVotes + voteCounts + totalVoters 즉시 반영
    setUserVotes((prev) => ({ ...prev, [poll.id]: { ...prevVote, optionId } }));
    setPolls((prev) => prev.map((p) => {
      if (p.id !== poll.id) return p;
      const counts = { ...(p.voteCounts ?? {}) };
      if (prevOptionId) counts[prevOptionId] = Math.max(0, (counts[prevOptionId] ?? 0) - 1);
      counts[optionId] = (counts[optionId] ?? 0) + 1;
      return { ...p, voteCounts: counts, totalVoters: prevOptionId ? p.totalVoters : (p.totalVoters ?? 0) + 1 };
    }));

    try {
      setVotingPollId(poll.id);
      await castVote(poll.id, user.uid, optionId, prevOptionId, poll.isGuestOnly ? guestVoterInfo : undefined);
    } catch (e) {
      console.error(e);
      // 롤백
      setUserVotes((prev) => ({ ...prev, [poll.id]: prevVote ?? null }));
      setPolls((prev) => prev.map((p) => {
        if (p.id !== poll.id) return p;
        const counts = { ...(p.voteCounts ?? {}) };
        counts[optionId] = Math.max(0, (counts[optionId] ?? 0) - 1);
        if (prevOptionId) counts[prevOptionId] = (counts[prevOptionId] ?? 0) + 1;
        return { ...p, voteCounts: counts, totalVoters: prevOptionId ? p.totalVoters : Math.max(0, (p.totalVoters ?? 0) - 1) };
      }));
      alert("투표 처리 중 오류가 발생했습니다.");
    } finally {
      setVotingPollId(null);
    }
  };

  const handleMultiVote = async (poll: Poll, optionId: string) => {
    if (!user || votingPollId) return;
    const prevVote = userVotes[poll.id];
    const prevOptionIds: string[] = prevVote?.optionIds ?? [];
    const selecting = !prevOptionIds.includes(optionId);
    const nextOptionIds = selecting
      ? [...prevOptionIds, optionId]
      : prevOptionIds.filter((id) => id !== optionId);

    // 낙관적 업데이트
    setUserVotes((prev) => ({ ...prev, [poll.id]: { ...prevVote, optionIds: nextOptionIds } }));
    setPolls((prev) => prev.map((p) => {
      if (p.id !== poll.id) return p;
      const counts = { ...(p.voteCounts ?? {}) };
      counts[optionId] = Math.max(0, (counts[optionId] ?? 0) + (selecting ? 1 : -1));
      const totalVoters = selecting && prevOptionIds.length === 0
        ? (p.totalVoters ?? 0) + 1
        : !selecting && prevOptionIds.length === 1
        ? Math.max(0, (p.totalVoters ?? 0) - 1)
        : p.totalVoters;
      return { ...p, voteCounts: counts, totalVoters };
    }));

    try {
      setVotingPollId(poll.id);
      await castMultiVote(poll.id, user.uid, optionId, selecting, prevOptionIds, poll.isGuestOnly ? guestVoterInfo : undefined);
    } catch (e) {
      console.error(e);
      // 롤백
      setUserVotes((prev) => ({ ...prev, [poll.id]: prevVote ?? null }));
      setPolls((prev) => prev.map((p) => {
        if (p.id !== poll.id) return p;
        const counts = { ...(p.voteCounts ?? {}) };
        counts[optionId] = Math.max(0, (counts[optionId] ?? 0) + (selecting ? -1 : 1));
        const totalVoters = selecting && prevOptionIds.length === 0
          ? Math.max(0, (p.totalVoters ?? 0) - 1)
          : !selecting && prevOptionIds.length === 1
          ? (p.totalVoters ?? 0) + 1
          : p.totalVoters;
        return { ...p, voteCounts: counts, totalVoters };
      }));
      alert("투표 처리 중 오류가 발생했습니다.");
    } finally {
      setVotingPollId(null);
    }
  };

  return (
    <>
      {/* 발표 모드 오버레이 */}
      {isPresenting && <PresentationView polls={polls} onExit={exitPresentation} />}

      <div className="flex flex-col min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
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

        <main className="p-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-toss-blue" size={32} />
            </div>
          ) : polls.length === 0 ? (
            <div className="bg-white dark:bg-surface rounded-toss p-12 shadow-sm border border-toss-border/40 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Vote size={32} className="text-indigo-400" />
              </div>
              <p className="text-base font-bold text-toss-black">진행 중인 투표가 없습니다</p>
              <p className="text-sm text-toss-gray">운영진이 투표를 시작하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                userVote={userVotes[poll.id] ?? null}
                isGuest={isGuest}
                votingPollId={votingPollId}
                onSingleVote={handleSingleVote}
                onMultiVote={handleMultiVote}
              />
            ))
          )}
        </main>
      </div>
    </>
  );
}
