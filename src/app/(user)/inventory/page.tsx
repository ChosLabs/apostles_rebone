"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Package, Upload, Loader2, X } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  subscribeCategories, subscribeItems,
  addItem, updateItemQuantity, updateItemInfo,
} from "@/lib/services/inventoryService";
import { InventoryCategory, InventoryItem } from "@/types/database";

type Tab = "stock" | "register";

export default function InventoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("stock");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // 물품 등록 form
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regPreview, setRegPreview] = useState<string | null>(null);
  const [regName, setRegName] = useState("");
  const [regCatId, setRegCatId] = useState("");
  const [regQty, setRegQty] = useState(1);
  const [regSaving, setRegSaving] = useState(false);
  const regFileRef = useRef<HTMLInputElement>(null);

  // 수량 수정 modal
  const [qtyItem, setQtyItem] = useState<InventoryItem | null>(null);
  const [qtyValue, setQtyValue] = useState(0);
  const [qtyInput, setQtyInput] = useState("0");
  const [qtySaving, setQtySaving] = useState(false);

  // 정보 수정 modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCatId, setEditCatId] = useState("");
  const [editInitQty, setEditInitQty] = useState(1);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u1 = subscribeCategories(setCategories);
    const u2 = subscribeItems((data) => { setItems(data); setLoading(false); });
    return () => { u1(); u2(); };
  }, []);

  const filtered = selectedCat === "all"
    ? items
    : items.filter((i) => i.categoryId === selectedCat);

  // ── 등록 ──────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!user || !regFile || !regName.trim() || !regCatId) {
      alert("이미지, 이름, 카테고리를 모두 입력해주세요."); return;
    }
    const cat = categories.find((c) => c.id === regCatId);
    if (!cat) return;
    try {
      setRegSaving(true);
      await addItem(regFile, regName.trim(), regCatId, cat.name, regQty, user.uid, user.name);
      setRegFile(null); setRegPreview(null); setRegName(""); setRegCatId(""); setRegQty(1);
      if (regFileRef.current) regFileRef.current.value = "";
      setTab("stock");
    } catch { alert("등록에 실패했습니다."); }
    finally { setRegSaving(false); }
  };

  // ── 수량 수정 ──────────────────────────────────────────────
  const openQty = (item: InventoryItem) => {
    setQtyItem(item);
    setQtyValue(item.currentQuantity);
    setQtyInput(String(item.currentQuantity));
  };
  const handleQtySave = async () => {
    if (!qtyItem) return;
    try { setQtySaving(true); await updateItemQuantity(qtyItem.id, qtyValue); setQtyItem(null); }
    catch { alert("수정에 실패했습니다."); }
    finally { setQtySaving(false); }
  };

  // ── 정보 수정 ──────────────────────────────────────────────
  const openEdit = (item: InventoryItem) => {
    setEditItem(item); setEditName(item.name);
    setEditCatId(item.categoryId); setEditInitQty(item.initialQuantity);
    setEditFile(null); setEditPreview(null);
  };
  const handleEditSave = async () => {
    if (!editItem || !editName.trim() || !editCatId) return;
    const cat = categories.find((c) => c.id === editCatId);
    try {
      setEditSaving(true);
      await updateItemInfo(
        editItem.id,
        { name: editName.trim(), categoryId: editCatId, categoryName: cat?.name ?? "", initialQuantity: editInitQty },
        editFile ?? undefined, editItem.storagePath
      );
      setEditItem(null);
    } catch { alert("수정에 실패했습니다."); }
    finally { setEditSaving(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-surface px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/more" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">재고관리</h1>
      </header>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-surface border-b border-toss-border/20 sticky top-[61px] z-40">
        {([
          { id: "stock", label: "재고 현황" },
          { id: "register", label: "물품 등록" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx("flex-1 py-3 text-xs font-bold transition-colors",
              tab === t.id ? "text-toss-blue border-b-2 border-toss-blue" : "text-toss-gray"
            )}
          >{t.label}</button>
        ))}
      </div>

      <main className="p-4">
        {/* ── 재고 현황 ───────────────────────────────────────── */}
        {tab === "stock" && (
          <div className="flex flex-col gap-3">
            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSelectedCat("all")}
                className={clsx("px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                  selectedCat === "all" ? "bg-toss-blue text-white" : "bg-white dark:bg-surface border border-toss-border text-toss-gray"
                )}>전체 ({items.length})</button>
              {categories.map((c) => {
                const cnt = items.filter((i) => i.categoryId === c.id).length;
                return (
                  <button key={c.id} onClick={() => setSelectedCat(c.id)}
                    className={clsx("px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                      selectedCat === c.id ? "bg-toss-blue text-white" : "bg-white dark:bg-surface border border-toss-border text-toss-gray"
                    )}>{c.name} ({cnt})</button>
                );
              })}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-toss-blue" size={32} /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-3 text-center">
                <Package size={32} className="text-toss-gray/30" />
                <p className="text-sm font-bold text-toss-black">등록된 물품이 없어요</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isOwner = user?.uid === item.registeredById;
                const pct = item.initialQuantity > 0
                  ? Math.round((item.currentQuantity / item.initialQuantity) * 100) : 0;
                return (
                  <div key={item.id} className="bg-white dark:bg-surface rounded-toss border border-toss-border/40 shadow-sm p-4 flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-toss-lightGray">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-toss-black">{item.name}</p>
                          <p className="text-[10px] text-toss-gray mt-0.5">{item.categoryName} · {item.registeredByName}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openQty(item)}
                            className="p-1.5 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all">
                            <Pencil size={14} />
                          </button>
                          {isOwner && (
                            <button onClick={() => openEdit(item)}
                              className="p-1.5 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all">
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[11px] font-black text-toss-blue">{item.currentQuantity} / {item.initialQuantity}</span>
                          <span className="text-[10px] text-toss-gray">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-toss-lightGray rounded-full overflow-hidden">
                          <div className={clsx("h-full rounded-full transition-all",
                            pct <= 20 ? "bg-red-500" : pct <= 50 ? "bg-orange-400" : "bg-toss-blue"
                          )} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── 물품 등록 ───────────────────────────────────────── */}
        {tab === "register" && (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {/* 이미지 */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">이미지</label>
              <div onClick={() => regFileRef.current?.click()}
                className={clsx("w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                  regPreview ? "border-toss-blue/30" : "border-toss-border hover:border-toss-blue/50"
                )}>
                {regPreview
                  ? <div className="relative w-full h-full"><Image src={regPreview} alt="" fill className="object-contain rounded-2xl" unoptimized /></div>
                  : <><Upload size={24} className="text-toss-gray/40" /><p className="text-xs font-bold text-toss-gray">클릭하여 이미지 선택</p></>
                }
              </div>
              <input ref={regFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setRegFile(f); setRegPreview(URL.createObjectURL(f)); }}} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">물품명</label>
              <input value={regName} onChange={(e) => setRegName(e.target.value)}
                placeholder="예: 생수 500mL" className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">카테고리</label>
              <select value={regCatId} onChange={(e) => setRegCatId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm bg-white dark:bg-surface">
                <option value="">카테고리 선택</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">초기 수량</label>
              <input type="number" min={0} value={regQty} onChange={(e) => setRegQty(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
            </div>

            <button onClick={handleRegister} disabled={regSaving}
              className="w-full py-4 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {regSaving && <Loader2 size={18} className="animate-spin" />}
              등록하기
            </button>
          </div>
        )}
      </main>

      {/* 수량 수정 모달 */}
      {qtyItem && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setQtyItem(null)}>
          <div className="bg-white dark:bg-surface w-full max-w-[420px] rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-toss-border" />
            </div>
            <div className="px-6 pt-3 pb-2 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-toss-black">현재고 수정</h2>
                <p className="text-sm text-toss-gray mt-0.5">{qtyItem.name}</p>
              </div>
              <button onClick={() => setQtyItem(null)} className="p-2 hover:bg-toss-lightGray rounded-full transition-colors">
                <X size={20} className="text-toss-gray" />
              </button>
            </div>
            <div className="px-6 pb-8 pt-4 space-y-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { const n = Math.max(0, qtyValue - 1); setQtyValue(n); setQtyInput(String(n)); }}
                  className="w-12 h-12 shrink-0 rounded-full bg-toss-lightGray font-bold text-2xl flex items-center justify-center hover:bg-toss-border active:scale-95 transition-all"
                >−</button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={qtyInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setQtyInput(raw);
                    setQtyValue(raw === "" ? 0 : parseInt(raw));
                  }}
                  onBlur={() => { if (qtyInput === "") setQtyInput("0"); }}
                  className="flex-1 min-w-0 text-center px-3 py-3 border border-toss-border rounded-2xl font-black text-2xl focus:border-toss-blue outline-none"
                />
                <button
                  onClick={() => { const n = qtyValue + 1; setQtyValue(n); setQtyInput(String(n)); }}
                  className="w-12 h-12 shrink-0 rounded-full bg-toss-lightGray font-bold text-2xl flex items-center justify-center hover:bg-toss-border active:scale-95 transition-all"
                >+</button>
              </div>
              <p className="text-xs text-toss-gray text-center">초기 수량: {qtyItem.initialQuantity}개</p>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setQtyItem(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-toss-gray bg-toss-lightGray active:scale-[0.98] transition-all">취소</button>
                <button onClick={handleQtySave} disabled={qtySaving}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-toss-blue flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-all">
                  {qtySaving && <Loader2 size={16} className="animate-spin" />}저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 정보 수정 모달 */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditItem(null)}>
          <div className="bg-white dark:bg-surface w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center sticky top-0 bg-white dark:bg-surface">
              <h2 className="text-base font-black text-toss-black">물품 정보 수정</h2>
              <button onClick={() => setEditItem(null)}><X size={20} className="text-toss-gray" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div onClick={() => editFileRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-toss-border flex items-center justify-center cursor-pointer overflow-hidden relative">
                <Image src={editPreview ?? editItem.imageUrl} alt="" fill className="object-contain" unoptimized />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); }}} />
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
              <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm bg-white dark:bg-surface">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-toss-gray whitespace-nowrap">초기 수량</label>
                <input type="number" min={0} value={editInitQty} onChange={(e) => setEditInitQty(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditItem(null)} className="flex-1 py-3 rounded-2xl font-bold text-toss-gray bg-toss-lightGray">취소</button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-[2] py-3 rounded-2xl font-bold text-white bg-toss-blue flex items-center justify-center gap-2 disabled:opacity-60">
                  {editSaving && <Loader2 size={16} className="animate-spin" />}저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
