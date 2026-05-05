"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  MessageSquare,
  User,
  Users,
  Clock,
  Heart,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { subscribeAllPrayers, deletePrayer } from "@/lib/services/prayService";
import { PrayerRequest } from "@/types/database";

export default function AdminPrayPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "all-type" | "group">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);

  useEffect(() => {
    const unsub = subscribeAllPrayers((data) => {
      setRequests(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 기도제목을 삭제하시겠습니까?")) return;
    try {
      await deletePrayer(id);
      if (selectedRequest?.id === id) setSelectedRequest(null);
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const filtered = requests.filter((r) => {
    const matchType =
      activeFilter === "all" ||
      (activeFilter === "all-type" && r.type === "all") ||
      (activeFilter === "group" && r.type === "group");
    const matchSearch =
      !searchQuery ||
      r.userName.includes(searchQuery) ||
      r.content.includes(searchQuery);
    return matchType && matchSearch;
  });

  const anonymousCount = requests.filter((r) => r.userName === "익명").length;
  const anonymousPct = requests.length > 0 ? Math.round((anonymousCount / requests.length) * 100) : 0;
  const totalLikes = requests.reduce((acc, r) => acc + r.likes.length, 0);

  const formatDate = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">기도제목 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">참석자들이 올린 기도제목을 모니터링하고 관리합니다.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-[10px] lg:text-xs font-bold text-toss-gray mb-1">전체 기도제목 개수</p>
          <p className="text-base lg:text-xl font-black text-toss-black">{requests.length}개</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-[10px] lg:text-xs font-bold text-toss-gray mb-1">익명 비율</p>
          <p className="text-base lg:text-xl font-black text-toss-black">{anonymousPct}%</p>
        </div>
        <div className="bg-white p-4 lg:p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-[10px] lg:text-xs font-bold text-toss-gray mb-1">총 기도 횟수</p>
          <p className="text-base lg:text-xl font-black text-toss-blue">{totalLikes.toLocaleString()}회</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex p-1 bg-toss-lightGray rounded-xl w-full sm:w-fit overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "전체" },
            { id: "all-type", label: "모두에게" },
            { id: "group", label: "조별" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`flex-1 sm:flex-none px-4 lg:px-6 py-2 rounded-lg font-bold text-xs lg:text-sm transition-all whitespace-nowrap ${
                activeFilter === filter.id
                  ? "bg-white text-toss-blue shadow-sm"
                  : "text-toss-gray hover:text-toss-black"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 기도 내용 검색..."
            className="pl-10 pr-4 py-2 bg-white border border-toss-border rounded-xl text-sm focus:ring-1 focus:ring-toss-blue outline-none w-full"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-toss-border text-center text-toss-gray font-bold text-sm">
          {requests.length === 0 ? "등록된 기도제목이 없습니다." : "검색 결과가 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((request) => (
            <div
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className="bg-white p-6 rounded-3xl border border-toss-border shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${request.userName === "익명" ? "bg-toss-lightGray text-toss-gray" : "bg-toss-blue/10 text-toss-blue"}`}>
                    {request.userName === "익명" ? <User size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-toss-black">{request.userName}</span>
                      {request.type === "group" && (
                        <span className="text-[10px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">{request.group}조</span>
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        request.type === "all"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {request.type === "all" ? "모두에게" : "조별"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-toss-gray mt-0.5">
                      <Clock size={12} />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(request.id, e)}
                  className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-sm text-toss-black leading-relaxed mb-4 font-medium">
                "{request.content}"
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-toss-border/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-toss-gray">
                  <Heart size={14} className="text-red-400" fill={request.likes.length > 0 ? "currentColor" : "none"} />
                  함께 기도 {request.likes.length}회
                </div>
                {request.userTeam && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-toss-gray">
                    <Users size={14} />
                    {request.userTeam}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-toss-border flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-toss-blue uppercase tracking-wider">기도제목 상세</span>
                <h2 className="text-lg font-black text-toss-black">{selectedRequest.userName}</h2>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                  selectedRequest.type === "all" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-blue-50 text-blue-600 border-blue-100"
                }`}>
                  {selectedRequest.type === "all" ? "모두에게" : `${selectedRequest.group}조`}
                </span>
                {selectedRequest.userTeam && (
                  <span className="text-xs font-bold px-2 py-1 rounded-lg border bg-toss-lightGray text-toss-gray border-toss-border">{selectedRequest.userTeam}</span>
                )}
                <span className="text-xs text-toss-gray py-1">{formatDate(selectedRequest.createdAt)}</span>
              </div>

              <div className="p-4 bg-toss-lightGray/50 rounded-2xl border border-toss-border/40">
                <p className="text-sm text-toss-black font-medium leading-relaxed whitespace-pre-wrap">
                  "{selectedRequest.content}"
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-toss-gray">
                <Heart size={16} className="text-red-400" fill="currentColor" />
                함께 기도한 사람: {selectedRequest.likes.length}명
              </div>
            </div>

            <div className="px-6 py-4 border-t border-toss-border bg-toss-lightGray/30 flex gap-3 shrink-0">
              <button
                onClick={(e) => { handleDelete(selectedRequest.id, e); setSelectedRequest(null); }}
                className="flex-1 py-2.5 text-red-500 font-bold rounded-xl border border-red-100 hover:bg-red-50 transition-colors text-sm"
              >
                삭제
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 py-2.5 bg-toss-blue text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
