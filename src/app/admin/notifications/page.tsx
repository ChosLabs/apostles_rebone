"use client";

import { useState, useEffect } from "react";
import {
  BellRing, Send, Trash2, Loader2, Smartphone, AlertTriangle,
  Check, CheckCircle2, XCircle, AlertCircle, RefreshCw, Bell,
} from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { NotificationHistory } from "@/types/database";

export default function AdminNotificationsPage() {
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // 등록 기기 수
  const refreshCount = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setDeviceCount(d.count ?? 0))
      .catch(() => setDeviceCount(0));
  };

  useEffect(() => {
    refreshCount();
  }, []);

  // 히스토리 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, "notificationHistory"),
      orderBy("sentAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(
        snap.docs.map((d) => ({ id: d.id, ...d.data() })) as NotificationHistory[]
      );
      setHistoryLoading(false);
    });
    return unsub;
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setResult({ type: "error", message: "제목과 내용을 모두 입력해주세요." });
      return;
    }
    try {
      setIsSending(true);
      setResult(null);
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), source: "manual" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({
        type: "success",
        message: `${data.sent}개 기기에 알림을 전송했습니다.${data.failed > 0 ? ` (실패 ${data.failed}개 자동 정리)` : ""}`,
      });
      setTitle("");
      setBody("");
      refreshCount();
    } catch (e: any) {
      setResult({ type: "error", message: `전송 실패: ${e.message}` });
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async (item: NotificationHistory) => {
    try {
      setResendingId(item.id);
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, body: item.body, source: item.source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ type: "success", message: `재전송 완료: ${data.sent}개 기기에 전송했습니다.` });
      refreshCount();
    } catch (e: any) {
      setResult({ type: "error", message: `재전송 실패: ${e.message}` });
    } finally {
      setResendingId(null);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notificationHistory", id));
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleClear = async () => {
    if (!confirm(`등록된 FCM 토큰 ${deviceCount}개를 모두 삭제하시겠습니까?\n\n삭제 후 유저들이 앱에 재접속하면 알림 권한을 다시 허용해야 합니다.`)) return;
    try {
      setIsClearing(true);
      setResult(null);
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ type: "success", message: `토큰 ${data.cleared}개를 초기화했습니다.` });
      setDeviceCount(0);
    } catch (e: any) {
      setResult({ type: "error", message: `초기화 실패: ${e.message}` });
    } finally {
      setIsClearing(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "-";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("ko-KR", {
      month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getStatus = (item: NotificationHistory) => {
    if (item.totalTokens === 0) return "empty";
    if (item.failed === 0) return "success";
    if (item.sent === 0) return "error";
    return "partial";
  };

  const statusConfig = {
    success: { icon: <CheckCircle2 size={15} />, color: "text-emerald-600", bg: "bg-emerald-50", label: "전송 완료" },
    partial: { icon: <AlertCircle size={15} />, color: "text-amber-600", bg: "bg-amber-50", label: "일부 실패" },
    error: { icon: <XCircle size={15} />, color: "text-red-500", bg: "bg-red-50", label: "전송 실패" },
    empty: { icon: <AlertCircle size={15} />, color: "text-toss-gray", bg: "bg-toss-lightGray", label: "기기 없음" },
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue focus:ring-1 focus:ring-toss-blue outline-none transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-toss-black">알림 관리</h1>
        <p className="text-xs lg:text-sm text-toss-gray mt-1">
          FCM 푸시 알림을 전체 기기에 전송하거나 토큰을 초기화합니다.
        </p>
      </div>

      {/* 결과 메시지 */}
      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-bold animate-in fade-in duration-200 ${
          result.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-red-50 text-red-600 border border-red-100"
        }`}>
          {result.type === "success"
            ? <Check size={16} className="mt-0.5 shrink-0" />
            : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          {result.message}
        </div>
      )}

      {/* 등록 기기 수 */}
      <div className="bg-white rounded-2xl border border-toss-border shadow-sm p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-toss-blue/10 rounded-2xl flex items-center justify-center shrink-0">
          <Smartphone size={22} className="text-toss-blue" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-toss-gray mb-0.5">알림 권한 등록 기기</p>
          <p className="text-2xl font-black text-toss-black">
            {deviceCount === null
              ? <Loader2 size={20} className="animate-spin inline text-toss-gray" />
              : `${deviceCount}대`}
          </p>
        </div>
        <button
          onClick={refreshCount}
          className="p-2 text-toss-gray hover:bg-toss-lightGray rounded-xl transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 알림 전송 */}
        <div className="bg-white rounded-2xl border border-toss-border shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-toss-blue/10 rounded-xl flex items-center justify-center">
              <BellRing size={18} className="text-toss-blue" />
            </div>
            <div>
              <h2 className="text-base font-black text-toss-black">알림 전송</h2>
              <p className="text-xs text-toss-gray">등록된 전체 기기에 푸시 알림을 전송합니다.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-toss-gray px-1">알림 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 📢 공지"
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-toss-gray px-1">알림 내용</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="알림 내용을 입력하세요"
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-toss-blue text-white font-bold rounded-xl hover:bg-toss-blue/90 disabled:opacity-50 transition-all text-sm"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? "전송 중..." : "전체 기기에 알림 전송"}
          </button>
        </div>

        {/* 토큰 초기화 */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-black text-toss-black">알림 권한 초기화</h2>
              <p className="text-xs text-toss-gray">저장된 FCM 토큰을 전부 삭제합니다.</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 font-medium leading-relaxed">
            초기화 후 유저가 앱에 재접속하면 알림 권한을 다시 허용해야만 알림을 받을 수 있습니다.
          </div>

          <button
            onClick={handleClear}
            disabled={isClearing || deviceCount === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 disabled:opacity-50 transition-all text-sm border border-red-100"
          >
            {isClearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isClearing ? "초기화 중..." : `FCM 토큰 전체 초기화 (${deviceCount ?? 0}개)`}
          </button>
        </div>
      </div>

      {/* 전송 히스토리 */}
      <div className="bg-white rounded-2xl border border-toss-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-toss-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-toss-lightGray rounded-xl flex items-center justify-center">
              <Bell size={16} className="text-toss-gray" />
            </div>
            <div>
              <h2 className="text-base font-black text-toss-black">전송 히스토리</h2>
              <p className="text-xs text-toss-gray">전송된 알림과 성공/실패 현황을 확인합니다.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-toss-gray">{history.length}건</span>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-toss-gray" size={24} />
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-sm text-toss-gray font-medium">
            전송된 알림이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-toss-border">
            {history.map((item) => {
              const status = getStatus(item);
              const cfg = statusConfig[status];
              const isResending = resendingId === item.id;

              return (
                <div key={item.id} className="px-6 py-4 flex items-start gap-4 hover:bg-toss-lightGray/30 transition-colors group">
                  {/* 소스 아이콘 */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.source === "notice" ? "bg-toss-blue/10" : "bg-indigo-50"
                  }`}>
                    {item.source === "notice"
                      ? <Bell size={16} className="text-toss-blue" />
                      : <BellRing size={16} className="text-indigo-500" />}
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-black text-toss-black truncate">{item.title}</span>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}{cfg.label}
                      </span>
                      {item.source === "notice" && (
                        <span className="shrink-0 text-[10px] font-bold text-toss-blue bg-toss-blue/10 px-2 py-0.5 rounded-full">공지 자동</span>
                      )}
                    </div>
                    <p className="text-xs text-toss-gray truncate mb-1.5">{item.body}</p>
                    <div className="flex items-center gap-3 text-[11px] text-toss-gray font-medium flex-wrap">
                      <span>{formatDate(item.sentAt)}</span>
                      <span className="text-toss-border">|</span>
                      <span>
                        대상 <b className="text-toss-black">{item.totalTokens}</b>개
                      </span>
                      <span className="text-emerald-600 font-bold">
                        <CheckCircle2 size={11} className="inline mr-0.5" />{item.sent}
                      </span>
                      {item.failed > 0 && (
                        <span className="text-red-500 font-bold">
                          <XCircle size={11} className="inline mr-0.5" />{item.failed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleResend(item)}
                      disabled={isResending}
                      title="재전송"
                      className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isResending
                        ? <Loader2 size={15} className="animate-spin" />
                        : <RefreshCw size={15} />}
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      title="기록 삭제"
                      className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
