"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, Loader2, Package, X, Upload, Users } from "lucide-react";
import { clsx } from "clsx";
import {
  subscribeCategories, subscribeItems, subscribeManagers,
  addCategory, updateCategory, deleteCategory,
  updateItemInfo, updateItemQuantity, deleteItem,
  addManager, removeManager,
} from "@/lib/services/inventoryService";
import { getParticipants } from "@/lib/services/participantService";
import { InventoryCategory, InventoryItem, InventoryManager, Participant } from "@/types/database";

type Tab = "items" | "categories" | "managers";

export default function AdminInventoryPage() {
  const [tab, setTab] = useState<Tab>("items");
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [managers, setManagers] = useState<InventoryManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("all");

  // 카테고리 편집
  const [catModal, setCatModal] = useState<{ id?: string; name: string } | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  // 물품 편집
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCatId, setEditCatId] = useState("");
  const [editInitQty, setEditInitQty] = useState(1);
  const [editCurQty, setEditCurQty] = useState(0);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // 담당자
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [addingManager, setAddingManager] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const u1 = subscribeCategories(setCategories);
    const u2 = subscribeItems((data) => { setItems(data); setLoading(false); });
    const u3 = subscribeManagers(setManagers);
    return () => { u1(); u2(); u3(); };
  }, []);

  const filtered = selectedCat === "all" ? items : items.filter((i) => i.categoryId === selectedCat);

  // ── 카테고리 저장 ──────────────────────────────────────────
  const handleCatSave = async () => {
    if (!catModal?.name.trim()) return;
    try {
      setCatSaving(true);
      if (catModal.id) await updateCategory(catModal.id, catModal.name.trim());
      else await addCategory(catModal.name.trim());
      setCatModal(null);
    } catch { alert("저장에 실패했습니다."); }
    finally { setCatSaving(false); }
  };

  const handleCatDelete = async (id: string) => {
    if (!confirm("카테고리를 삭제하시겠습니까?")) return;
    await deleteCategory(id);
  };

  // ── 물품 편집 ──────────────────────────────────────────────
  const openEdit = (item: InventoryItem) => {
    setEditItem(item); setEditName(item.name); setEditCatId(item.categoryId);
    setEditInitQty(item.initialQuantity); setEditCurQty(item.currentQuantity);
    setEditFile(null); setEditPreview(null);
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    const cat = categories.find((c) => c.id === editCatId);
    try {
      setEditSaving(true);
      await updateItemInfo(
        editItem.id,
        { name: editName.trim(), categoryId: editCatId, categoryName: cat?.name ?? "", initialQuantity: editInitQty },
        editFile ?? undefined, editItem.storagePath
      );
      await updateItemQuantity(editItem.id, editCurQty);
      setEditItem(null);
    } catch { alert("수정에 실패했습니다."); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`"${item.name}"을(를) 삭제하시겠습니까?`)) return;
    try { setDeletingId(item.id); await deleteItem(item.id, item.storagePath); }
    catch { alert("삭제에 실패했습니다."); }
    finally { setDeletingId(null); }
  };

  // ── 담당자 ──────────────────────────────────────────────────
  const handleOpenAddManager = async () => {
    if (participants.length === 0) {
      const all = await getParticipants();
      setParticipants(all);
    }
    setManagerSearch(""); setAddingManager(true);
  };

  const handleAddManager = async (p: Participant) => {
    await addManager(p.id, p.name);
    setAddingManager(false);
  };

  const handleRemoveManager = async (id: string) => {
    if (!confirm("담당자를 제거하시겠습니까?")) return;
    try { setRemovingId(id); await removeManager(id); }
    catch { alert("제거에 실패했습니다."); }
    finally { setRemovingId(null); }
  };

  const managerIds = new Set(managers.map((m) => m.id));
  const filteredParticipants = participants
    .filter((p) => !managerIds.has(p.id) && p.name.includes(managerSearch));

  const totalItems = items.length;
  const lowStock = items.filter((i) => i.initialQuantity > 0 && i.currentQuantity / i.initialQuantity <= 0.2).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-toss-black">재고관리</h1>
        <p className="text-xs lg:text-sm text-toss-gray mt-1">물품 재고를 등록하고 관리합니다.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">전체 물품</p>
          <p className="text-xl font-black text-toss-black">{totalItems}개</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">카테고리</p>
          <p className="text-xl font-black text-toss-black">{categories.length}개</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-toss-border shadow-sm">
          <p className="text-xs font-bold text-toss-gray mb-1 uppercase">재고 부족</p>
          <p className={clsx("text-xl font-black", lowStock > 0 ? "text-red-500" : "text-toss-black")}>{lowStock}개</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-toss-border overflow-hidden shadow-sm">
        {([
          { id: "items", label: "물품 현황" },
          { id: "categories", label: "카테고리" },
          { id: "managers", label: "담당자" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx("flex-1 py-3 text-sm font-bold transition-colors",
              tab === t.id ? "bg-toss-blue text-white" : "text-toss-gray hover:bg-toss-lightGray"
            )}>{t.label}</button>
        ))}
      </div>

      {/* ── 물품 현황 ─────────────────────────────────────────── */}
      {tab === "items" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedCat("all")}
              className={clsx("px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                selectedCat === "all" ? "bg-toss-blue text-white" : "bg-white border border-toss-border text-toss-gray"
              )}>전체 ({items.length})</button>
            {categories.map((c) => {
              const cnt = items.filter((i) => i.categoryId === c.id).length;
              return (
                <button key={c.id} onClick={() => setSelectedCat(c.id)}
                  className={clsx("px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    selectedCat === c.id ? "bg-toss-blue text-white" : "bg-white border border-toss-border text-toss-gray"
                  )}>{c.name} ({cnt})</button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-toss-blue" size={32} /></div>
          ) : (
            <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-toss-lightGray/50 text-toss-gray text-[10px] font-black uppercase tracking-wider">
                    <th className="px-4 py-3">물품</th>
                    <th className="px-4 py-3">카테고리</th>
                    <th className="px-4 py-3">재고</th>
                    <th className="px-4 py-3">등록자</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-toss-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-toss-gray text-sm font-bold">물품이 없습니다.</td></tr>
                  ) : filtered.map((item) => {
                    const pct = item.initialQuantity > 0 ? Math.round((item.currentQuantity / item.initialQuantity) * 100) : 0;
                    return (
                      <tr key={item.id} className="hover:bg-toss-lightGray/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-toss-lightGray">
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                            </div>
                            <span className="text-sm font-bold text-toss-black">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs font-bold text-toss-gray bg-toss-lightGray px-2 py-1 rounded-lg">{item.categoryName}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between">
                              <span className={clsx("text-xs font-black", pct <= 20 ? "text-red-500" : "text-toss-blue")}>{item.currentQuantity}/{item.initialQuantity}</span>
                              <span className="text-[10px] text-toss-gray">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-toss-lightGray rounded-full overflow-hidden">
                              <div className={clsx("h-full rounded-full", pct <= 20 ? "bg-red-500" : pct <= 50 ? "bg-orange-400" : "bg-toss-blue")} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs text-toss-gray">{item.registeredByName}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEdit(item)} className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"><Pencil size={15} /></button>
                            <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50">
                              {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 카테고리 관리 ─────────────────────────────────────── */}
      {tab === "categories" && (
        <div className="space-y-4">
          <button onClick={() => setCatModal({ name: "" })}
            className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-toss-blue/90 shadow-sm shadow-toss-blue/20">
            <Plus size={18} />카테고리 추가
          </button>
          <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
            {categories.length === 0 ? (
              <div className="py-16 text-center text-toss-gray text-sm font-bold">카테고리가 없습니다.</div>
            ) : (
              <ul className="divide-y divide-toss-border">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-toss-black">{c.name}</p>
                      <p className="text-xs text-toss-gray">{items.filter((i) => i.categoryId === c.id).length}개 물품</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCatModal({ id: c.id, name: c.name })} className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"><Pencil size={15} /></button>
                      <button onClick={() => handleCatDelete(c.id)} className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── 담당자 관리 ───────────────────────────────────────── */}
      {tab === "managers" && (
        <div className="space-y-4">
          <button onClick={handleOpenAddManager}
            className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-toss-blue/90 shadow-sm shadow-toss-blue/20">
            <Plus size={18} />담당자 추가
          </button>
          <div className="bg-white rounded-3xl border border-toss-border shadow-sm overflow-hidden">
            {managers.length === 0 ? (
              <div className="py-16 text-center text-toss-gray text-sm font-bold">
                <Users size={32} strokeWidth={1.5} className="mx-auto mb-2 opacity-30" />
                등록된 담당자가 없습니다.
              </div>
            ) : (
              <ul className="divide-y divide-toss-border">
                {managers.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-toss-lightGray flex items-center justify-center font-bold text-toss-gray text-sm">{m.name[0]}</div>
                      <p className="text-sm font-bold text-toss-black">{m.name}</p>
                    </div>
                    <button onClick={() => handleRemoveManager(m.id)} disabled={removingId === m.id}
                      className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50">
                      {removingId === m.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 카테고리 모달 */}
      {catModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setCatModal(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center">
              <h2 className="text-base font-black text-toss-black">{catModal.id ? "카테고리 수정" : "카테고리 추가"}</h2>
              <button onClick={() => setCatModal(null)}><X size={20} className="text-toss-gray" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input value={catModal.name} onChange={(e) => setCatModal({ ...catModal, name: e.target.value })}
                placeholder="카테고리 이름" className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
              <div className="flex gap-3">
                <button onClick={() => setCatModal(null)} className="flex-1 py-3 rounded-2xl font-bold text-toss-gray bg-toss-lightGray">취소</button>
                <button onClick={handleCatSave} disabled={catSaving || !catModal.name.trim()}
                  className="flex-[2] py-3 rounded-2xl font-bold text-white bg-toss-blue flex items-center justify-center gap-2 disabled:opacity-60">
                  {catSaving && <Loader2 size={16} className="animate-spin" />}저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 담당자 추가 모달 */}
      {addingManager && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setAddingManager(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center shrink-0">
              <h2 className="text-base font-black text-toss-black">담당자 추가</h2>
              <button onClick={() => setAddingManager(false)}><X size={20} className="text-toss-gray" /></button>
            </div>
            <div className="px-4 py-3 border-b border-toss-border shrink-0">
              <input value={managerSearch} onChange={(e) => setManagerSearch(e.target.value)}
                placeholder="이름으로 검색" className="w-full px-4 py-2.5 rounded-xl border border-toss-border focus:border-toss-blue outline-none text-sm font-bold" />
            </div>
            <ul className="overflow-y-auto flex-1 divide-y divide-toss-border">
              {filteredParticipants.length === 0 ? (
                <li className="py-8 text-center text-sm text-toss-gray">검색 결과가 없습니다.</li>
              ) : filteredParticipants.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-toss-lightGray/30 cursor-pointer" onClick={() => handleAddManager(p)}>
                  <div>
                    <p className="text-sm font-bold text-toss-black">{p.name}</p>
                    <p className="text-xs text-toss-gray">{p.team}</p>
                  </div>
                  <Plus size={16} className="text-toss-blue" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 물품 편집 모달 */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setEditItem(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-toss-border flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-base font-black text-toss-black">물품 수정</h2>
              <button onClick={() => setEditItem(null)}><X size={20} className="text-toss-gray" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div onClick={() => editFileRef.current?.click()}
                className="w-full aspect-video rounded-2xl border-2 border-dashed border-toss-border flex items-center justify-center cursor-pointer overflow-hidden relative bg-toss-lightGray">
                <Image src={editPreview ?? editItem.imageUrl} alt="" fill className="object-contain" unoptimized />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); }}} />

              <div className="space-y-1">
                <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">물품명</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">카테고리</label>
                <select value={editCatId} onChange={(e) => setEditCatId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm bg-white">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">초기 수량</label>
                  <input type="number" min={0} value={editInitQty} onChange={(e) => setEditInitQty(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">현재 수량</label>
                  <input type="number" min={0} value={editCurQty} onChange={(e) => setEditCurQty(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none font-bold text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-toss-gray bg-toss-lightGray">취소</button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-toss-blue flex items-center justify-center gap-2 disabled:opacity-60">
                  {editSaving && <Loader2 size={16} className="animate-spin" />}저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
