"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Bell,
  BookOpen,
  Clock,
  Calendar,
  Vote,
  Image,
  Loader2,
  MapPin
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { PrayerRequest } from "@/types/database";

function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return "방금 전";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    participants: 0,
    notices: 0,
    prayers: 0,
    lectures: 0,
  });
  const [recentPrayers, setRecentPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const recentQ = query(
        collection(db, "prayers"),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const [participants, notices, prayers, lectures, recentSnap] = await Promise.all([
        getDocs(collection(db, "participants")),
        getDocs(collection(db, "notices")),
        getDocs(collection(db, "prayers")),
        getDocs(collection(db, "lectures")),
        getDocs(recentQ),
      ]);
      setCounts({
        participants: participants.size,
        notices: notices.size,
        prayers: prayers.size,
        lectures: lectures.size,
      });
      setRecentPrayers(recentSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrayerRequest)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    {
      label: "전체 참가자",
      value: `${counts.participants}명`,
      icon: <Users className="text-toss-blue" />,
      bgColor: "bg-toss-blue/10",
      href: "/admin/users",
    },
    {
      label: "전체 공지",
      value: `${counts.notices}개`,
      icon: <Bell className="text-orange-500" />,
      bgColor: "bg-orange-500/10",
      href: "/admin/notices",
    },
    {
      label: "전체 기도제목",
      value: `${counts.prayers}개`,
      icon: <MessageSquare className="text-green-500" />,
      bgColor: "bg-green-500/10",
      href: "/admin/pray",
    },
    {
      label: "전체 강의",
      value: `${counts.lectures}개`,
      icon: <BookOpen className="text-purple-500" />,
      bgColor: "bg-purple-500/10",
      href: "/admin/lectures",
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
          <Link key={stat.label} href={stat.href} className="bg-white p-6 rounded-2xl shadow-sm border border-toss-border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-toss-gray">{stat.label}</p>
              <h3 className="text-2xl font-black text-toss-black mt-1">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Prayers */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-toss-border overflow-hidden">
          <div className="p-6 border-b border-toss-border flex justify-between items-center">
            <h3 className="font-bold text-toss-black">최근 기도제목</h3>
            <Link href="/admin/pray" className="text-sm text-toss-blue font-bold hover:underline">전체보기</Link>
          </div>
          <div className="divide-y divide-toss-border">
            {recentPrayers.length === 0 ? (
              <div className="p-12 text-center text-toss-gray text-sm">
                등록된 기도제목이 없습니다.
              </div>
            ) : (
              recentPrayers.map((prayer) => (
                <div key={prayer.id} className="p-6 flex items-center gap-4 hover:bg-toss-lightGray/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-toss-lightGray flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-toss-gray" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-toss-black truncate">
                      {prayer.content}
                    </p>
                    <p className="text-xs text-toss-gray mt-1">
                      {formatRelativeTime(prayer.createdAt)} · <span className="font-medium">{prayer.userName}</span>
                      {prayer.userTeam && <span className="ml-1 text-toss-blue/70">{prayer.userTeam}</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-toss-border overflow-hidden h-fit">
          <div className="p-6 border-b border-toss-border">
            <h3 className="font-bold text-toss-black">빠른 작업</h3>
          </div>
          <div className="p-6 space-y-3">
            <Link href="/admin/notices" className="w-full bg-toss-blue text-white font-bold py-3 rounded-xl hover:bg-toss-blue/90 transition-colors flex items-center justify-center gap-2">
              <Bell size={18} />
              긴급 공지 등록
            </Link>
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
            <Link href="/admin/timetable" className="w-full bg-white text-toss-black border border-toss-border font-bold py-3 rounded-xl hover:bg-toss-lightGray transition-colors flex items-center justify-center gap-2">
              <Calendar size={18} />
              타임테이블 수정
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
