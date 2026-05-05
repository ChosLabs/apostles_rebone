"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  BookOpen,
  Vote,
  Image,
  Loader2,
  MapPin
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    participants: 0,
    notices: 0,
    prayers: 420 // Still mocked as requested/expected
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubParticipants = onSnapshot(collection(db, "participants"), (snap) => {
      setCounts(prev => ({ ...prev, participants: snap.size }));
    });
    const unsubNotices = onSnapshot(collection(db, "notices"), (snap) => {
      setCounts(prev => ({ ...prev, notices: snap.size }));
      setLoading(false);
    });

    return () => {
      unsubParticipants();
      unsubNotices();
    };
  }, []);

  const stats = [
    { 
      label: "전체 참가자", 
      value: `${counts.participants}명`, 
      change: "+12%", 
      trend: "up", 
      icon: <Users className="text-toss-blue" />,
      bgColor: "bg-toss-blue/10"
    },
    { 
      label: "전체 공지 개수", 
      value: `${counts.notices}개`, 
      change: "+2", 
      trend: "up", 
      icon: <Bell className="text-orange-500" />,
      bgColor: "bg-orange-500/10"
    },
    { 
      label: "전체 기도제목 개수", 
      value: "420개", 
      change: "+5%", 
      trend: "up", 
      icon: <MessageSquare className="text-green-500" />,
      bgColor: "bg-green-500/10"
    },
    { 
      label: "실시간 접속", 
      value: "156명", 
      change: "+18%", 
      trend: "up", 
      icon: <TrendingUp className="text-purple-500" />,
      bgColor: "bg-purple-500/10"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-toss-blue" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-toss-border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-toss-gray">{stat.label}</p>
              <h3 className="text-2xl font-black text-toss-black mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-toss-border overflow-hidden">
          <div className="p-6 border-b border-toss-border flex justify-between items-center">
            <h3 className="font-bold text-toss-black">최근 활동</h3>
            <button className="text-sm text-toss-blue font-bold hover:underline">전체보기</button>
          </div>
          <div className="divide-y divide-toss-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 flex items-center gap-4 hover:bg-toss-lightGray/30 transition-colors">
                <div className="w-10 h-10 rounded-full bg-toss-lightGray flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-toss-gray" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-toss-black truncate">
                    새로운 기도제목이 등록되었습니다.
                  </p>
                  <p className="text-xs text-toss-gray mt-1">
                    방금 전 · <span className="font-medium">익명의 참석자</span>
                  </p>
                </div>
                <button className="px-3 py-1.5 text-xs font-bold text-toss-gray border border-toss-border rounded-lg hover:bg-white transition-colors">
                  상세보기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-toss-border overflow-hidden h-fit">
          <div className="p-6 border-b border-toss-border">
            <h3 className="font-bold text-toss-black">빠른 작업</h3>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full bg-toss-blue text-white font-bold py-3 rounded-xl hover:bg-toss-blue/90 transition-colors flex items-center justify-center gap-2">
              <Bell size={18} />
              긴급 공지 등록
            </button>
            <Link href="/admin/lectures" className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <BookOpen size={18} />
              강의 관리
            </Link>
            <Link href="/admin/vote" className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <Vote size={18} />
              투표 관리
            </Link>
            <Link href="/admin/dispatched-church" className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <MapPin size={18} />
              파송교회 관리
            </Link>
            <Link href="/admin/inquiry" className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <MessageSquare size={18} />
              문의 관리
            </Link>
            <button className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <Calendar size={18} />
              타임테이블 수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
