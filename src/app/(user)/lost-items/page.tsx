"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PackageSearch, CheckCircle2, Clock } from "lucide-react";
import { clsx } from "clsx";
import { subscribeLostItems } from "@/lib/services/lostItemService";
import { LostItem } from "@/types/database";

type FilterType = "all" | "unclaimed" | "claimed";

export default function LostItemsPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const unsub = subscribeLostItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = items.filter((item) => {
    if (filter === "unclaimed") return !item.isClaimed;
    if (filter === "claimed") return item.isClaimed;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/more" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">분실물 안내</h1>
        {!loading && (
          <span className="ml-auto text-[11px] font-bold text-toss-gray">
            {filtered.length}건
          </span>
        )}
      </header>

      {/* 필터 탭 */}
      {!loading && items.length > 0 && (
        <div className="flex bg-white dark:bg-surface border-b border-toss-border/20 sticky top-[61px] z-40">
          {([
            { id: "all",       label: "전체",      count: items.length },
            { id: "unclaimed", label: "수령 대기", count: items.filter(i => !i.isClaimed).length },
            { id: "claimed",   label: "수령 완료", count: items.filter(i => i.isClaimed).length },
          ] as { id: FilterType; label: string; count: number }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                "flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1",
                filter === tab.id
                  ? "text-toss-blue border-b-2 border-toss-blue"
                  : "text-toss-gray"
              )}
            >
              {tab.label}
              <span className={clsx(
                "text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold",
                filter === tab.id ? "bg-toss-blue text-white" : "bg-toss-lightGray text-toss-gray"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <main className="p-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-toss-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30">
              <PackageSearch size={32} />
            </div>
            <p className="text-base font-bold text-toss-black">등록된 분실물이 없어요</p>
            <p className="text-sm text-toss-gray">분실물이 발견되면 여기에 표시됩니다.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-16 h-16 bg-toss-lightGray rounded-full flex items-center justify-center text-toss-gray/30">
              <PackageSearch size={32} />
            </div>
            <p className="text-base font-bold text-toss-black">해당하는 분실물이 없어요</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white dark:bg-surface rounded-toss border border-toss-border/40 shadow-sm overflow-hidden flex gap-4 p-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-toss-lightGray">
                <Image
                  src={item.imageUrl}
                  alt="분실물 이미지"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <p className="text-sm font-bold text-toss-black leading-snug line-clamp-2">
                  {item.description}
                </p>
                <span className={clsx(
                  "self-start text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1",
                  item.isClaimed
                    ? "bg-green-50 text-green-600"
                    : "bg-orange-50 text-orange-500"
                )}>
                  {item.isClaimed
                    ? <><CheckCircle2 size={12} /> 수령 완료</>
                    : <><Clock size={12} /> 수령 대기</>
                  }
                </span>
              </div>
            </div>
          ))
        )}
      </main>


      {/* 이미지 상세 모달 */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white dark:bg-surface w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square bg-toss-lightGray">
              <Image
                src={selectedItem.imageUrl}
                alt="분실물 이미지"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="p-5 flex flex-col gap-3">
              <p className="text-sm font-bold text-toss-black leading-relaxed">
                {selectedItem.description}
              </p>
              <span className={clsx(
                "self-start text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1",
                selectedItem.isClaimed
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-50 text-orange-500"
              )}>
                {selectedItem.isClaimed
                  ? <><CheckCircle2 size={12} /> 수령 완료</>
                  : <><Clock size={12} /> 수령 대기 중</>
                }
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 rounded-xl bg-toss-black text-white font-bold text-sm mt-1"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
