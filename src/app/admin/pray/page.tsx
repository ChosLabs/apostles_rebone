"use client";

import React, { useState } from "react";
import { 
  Search, 
  Trash2, 
  MessageSquare, 
  User, 
  Globe, 
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Heart,
  Eye,
  Filter,
  X
} from "lucide-react";

interface PrayRequest {
  id: number;
  author: string;
  content: string;
  type: "개인" | "조" | "전체";
  isAnonymous: boolean;
  groupNumber?: number;
  prayerCount: number;
  prayedUsers: string[];
  createdAt: string;
  status: "active" | "pinned" | "hidden";
}

export default function AdminPrayPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "personal" | "group" | "everyone">("all");
  const [selectedRequest, setSelectedRequest] = useState<PrayRequest | null>(null);
  
  // Mock data
  const [requests] = useState<PrayRequest[]>([
    { 
      id: 1, 
      author: "김철수", 
      content: "수련회 기간 동안 하나님을 깊이 만나고 제 비전을 찾는 시간이 되길 기도합니다.", 
      type: "전체", 
      isAnonymous: false, 
      prayerCount: 24, 
      prayedUsers: ["박지민", "김은혜", "이철수", "최영희", "정본향", "강하늘", "윤서준", "임지우", "조예준", "한지아", "송민호", "권다은", "정우성", "이영희", "박민준", "최서연", "김나현", "유재석", "강호동", "신동엽", "이수근", "김종국", "하하", "송지효"],
      createdAt: "2026-06-04 15:30",
      status: "pinned"
    },
    { 
      id: 2, 
      author: "익명", 
      content: "가정의 화목과 부모님의 건강을 위해 기도해주세요.", 
      type: "개인", 
      isAnonymous: true, 
      prayerCount: 12, 
      prayedUsers: ["김철수", "이영희", "박민준", "최서연", "정우성", "이지아", "노홍철", "정준하", "박명수", "길", "전진", "데프콘"],
      createdAt: "2026-06-04 14:20",
      status: "active"
    },
    { 
      id: 3, 
      author: "이영희", 
      content: "우리 12조 조원들이 모두 한마음으로 연합되길 소망합니다.", 
      type: "조", 
      groupNumber: 12, 
      isAnonymous: false, 
      prayerCount: 8, 
      prayedUsers: ["김철수", "박지민", "최서연", "정우성", "강하늘", "윤서준", "임지우", "조예준"],
      createdAt: "2026-06-04 10:00",
      status: "active"
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-toss-black">기도제목 관리</h1>
          <p className="text-sm text-toss-gray mt-1">참석자들이 올린 기도제목을 모니터링하고 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white text-toss-black border border-toss-border px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-lightGray transition-all">
            <Filter size={18} />
            필터 설정
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1">오늘 등록</p>
          <p className="text-xl font-black text-toss-black">42개</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1">총 기도 횟수</p>
          <p className="text-xl font-black text-toss-blue">1,240회</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1">익명 비율</p>
          <p className="text-xl font-black text-toss-black">35%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1">가장 많이 기도한 조</p>
          <p className="text-xl font-black text-green-500">12조</p>
        </div>
      </div>

      {/* List Filters */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex p-1 bg-toss-lightGray rounded-xl w-fit">
          {[
            { id: "all", label: "전체" },
            { id: "personal", label: "개인" },
            { id: "group", label: "조별" },
            { id: "everyone", label: "모두" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeFilter === filter.id 
                  ? "bg-white text-toss-blue shadow-sm" 
                  : "text-toss-gray hover:text-toss-black"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-toss-gray" />
          <input 
            type="text" 
            placeholder="이름 또는 기도 내용 검색..."
            className="pl-10 pr-4 py-2 bg-white border border-toss-border rounded-xl text-sm focus:ring-1 focus:ring-toss-blue outline-none w-full"
          />
        </div>
      </div>

      {/* Prayer Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <div 
            key={request.id} 
            onClick={() => setSelectedRequest(request)}
            className="bg-white p-6 rounded-3xl border border-toss-border shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${request.isAnonymous ? 'bg-toss-lightGray text-toss-gray' : 'bg-toss-blue/10 text-toss-blue'}`}>
                  {request.isAnonymous ? <User size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-toss-black">{request.author}</span>
                    {request.type === "조" && (
                      <span className="text-[10px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded border border-green-100">{request.groupNumber}조</span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      request.type === "전체" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : 
                      request.type === "개인" ? "bg-blue-50 text-blue-600 border-blue-100" : ""
                    }`}>
                      {request.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-toss-gray mt-0.5">
                    <Clock size={12} />
                    {request.createdAt}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {request.status === "pinned" && (
                  <span className="text-[11px] font-bold text-toss-blue bg-toss-blue/5 px-2 py-1 rounded-lg">고정됨</span>
                )}
                <button className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-xl transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            <p className="text-sm text-toss-black leading-relaxed mb-6 font-medium">
              "{request.content}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-toss-border/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-toss-gray">
                  <Heart size={14} className="text-red-400" fill={request.prayerCount > 0 ? "currentColor" : "none"} />
                  함께 기도 {request.prayerCount}회
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button className="text-xs font-bold text-toss-gray hover:text-toss-blue px-3 py-1.5 rounded-lg hover:bg-toss-blue/5 transition-all">
                  숨기기
                </button>
                <button className="text-xs font-bold text-toss-gray hover:text-toss-blue px-3 py-1.5 rounded-lg hover:bg-toss-blue/5 transition-all">
                  고정하기
                </button>
                <button className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-toss-border flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-toss-blue uppercase tracking-wider">Prayer Support List</span>
                <h2 className="text-xl font-black text-toss-black flex items-center gap-2">
                  함께 기도한 사람들
                  <span className="bg-toss-blue/10 text-toss-blue px-2.5 py-0.5 rounded-full text-sm">{selectedRequest.prayerCount}</span>
                </h2>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors text-toss-gray">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[500px] overflow-y-auto">
              <div className="mb-6 p-4 bg-toss-lightGray/50 rounded-2xl border border-toss-border/40">
                <p className="text-xs font-bold text-toss-gray mb-2">기도 내용</p>
                <p className="text-sm text-toss-black font-medium leading-relaxed italic">
                  "{selectedRequest.content}"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedRequest.prayedUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 bg-white border border-toss-border/60 rounded-xl hover:border-toss-blue/30 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-toss-lightGray flex items-center justify-center text-toss-gray/60 shrink-0">
                      <User size={14} />
                    </div>
                    <span className="text-sm font-bold text-toss-black truncate">{user}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-6 border-t border-toss-border bg-toss-lightGray/30 flex justify-end">
              <button 
                onClick={() => setSelectedRequest(null)}
                className="px-6 py-2.5 bg-toss-blue text-white font-bold rounded-xl hover:bg-toss-blue/90 transition-all shadow-md shadow-toss-blue/10"
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
