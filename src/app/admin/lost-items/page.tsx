"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, CheckCircle2, Clock, Loader2, PackageSearch, Upload, Pencil } from "lucide-react";
import { clsx } from "clsx";
import { subscribeLostItems, addLostItem, toggleClaimed, deleteLostItem, updateDescription } from "@/lib/services/lostItemService";
import { LostItem } from "@/types/database";

type FilterType = "all" | "unclaimed" | "claimed";

export default function AdminLostItemsPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<LostItem | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeLostItems((data) => {
      setItems(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setDescription("");
    setFile(null);
    setPreview(null);
    setIsAdding(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file || !description.trim()) {
      alert("이미지와 설명을 모두 입력해주세요.");
      return;
    }
    try {
      setIsSaving(true);
      await addLostItem(file, description.trim());
      resetForm();
    } catch (e) {
      alert("업로드에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (item: LostItem) => {
    try {
      setTogglingId(item.id);
      await toggleClaimed(item.id, !item.isClaimed);
    } catch {
      alert("상태 변경에 실패했습니다.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditSave = async () => {
    if (!editingItem || !editDesc.trim()) return;
    try {
      setIsSavingEdit(true);
      await updateDescription(editingItem.id, editDesc.trim());
      setEditingItem(null);
    } catch {
      alert("수정에 실패했습니다.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (item: LostItem) => {
    if (!confirm("분실물을 삭제하시겠습니까?")) return;
    try {
      setDeletingId(item.id);
      await deleteLostItem(item.id, item.storagePath);
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const claimed = items.filter((i) => i.isClaimed).length;
  const filtered = items.filter((i) => {
    if (filter === "unclaimed") return !i.isClaimed;
    if (filter === "claimed") return i.isClaimed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-toss-black">분실물 관리</h1>
          <p className="text-xs lg:text-sm text-toss-gray mt-1">발견된 분실물을 등록하고 수령 상태를 관리합니다.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-toss-blue text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-toss-blue/90 transition-all shadow-sm shadow-toss-blue/20 text-sm self-start"
        >
          <Plus size={20} />
          분실물 등록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { label: "전체",      value: items.length,          color: "text-toss-black", id: "all"       },
          { label: "수령 대기", value: items.length - claimed, color: "text-orange-500", id: "unclaimed" },
          { label: "수령 완료", value: claimed,                color: "text-green-600",  id: "claimed"   },
        ] as { label: string; value: number; color: string; id: FilterType }[]).map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={clsx(
              "p-5 rounded-2xl border shadow-sm text-left transition-all",
              filter === s.id
                ? "bg-toss-blue/5 border-toss-blue"
                : "bg-white border-toss-border hover:border-toss-blue/40"
            )}
          >
            <p className="text-xs font-bold text-toss-gray mb-1 uppercase">{s.label}</p>
            <p className={clsx("text-xl font-black", filter === s.id ? "text-toss-blue" : s.color)}>
              {s.value}건
            </p>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-toss-blue" size={32} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-toss-border py-20 flex flex-col items-center gap-3 text-toss-gray">
          <PackageSearch size={40} strokeWidth={1.5} />
          <p className="font-bold text-sm">등록된 분실물이 없습니다.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-toss-border py-20 flex flex-col items-center gap-3 text-toss-gray">
          <PackageSearch size={40} strokeWidth={1.5} />
          <p className="font-bold text-sm">해당하는 분실물이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-toss-border shadow-sm overflow-hidden">
              <div className="relative w-full aspect-video bg-toss-lightGray">
                <Image
                  src={item.imageUrl}
                  alt="분실물"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="text-sm font-bold text-toss-black leading-snug">{item.description}</p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={togglingId === item.id}
                    className={clsx(
                      "flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all",
                      item.isClaimed
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-orange-50 text-orange-500 hover:bg-orange-100"
                    )}
                  >
                    {togglingId === item.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : item.isClaimed ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {item.isClaimed ? "수령 완료" : "수령 대기"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingItem(item); setEditDesc(item.description); }}
                      className="p-2 text-toss-gray hover:text-toss-blue hover:bg-toss-blue/5 rounded-lg transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="p-2 text-toss-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      {editingItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-toss-border">
              <h2 className="text-lg font-black text-toss-black">설명 수정</h2>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={isSavingEdit || !editDesc.trim()}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSavingEdit && <Loader2 size={18} className="animate-spin" />}
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 등록 모달 */}
      {isAdding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-toss-border">
              <h2 className="text-lg font-black text-toss-black">분실물 등록</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* 이미지 업로드 */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">이미지</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                    preview ? "border-toss-blue/30" : "border-toss-border hover:border-toss-blue/50"
                  )}
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                      <Image src={preview} alt="미리보기" fill className="object-contain rounded-2xl" unoptimized />
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-toss-gray/40" />
                      <p className="text-xs font-bold text-toss-gray">클릭하여 이미지 선택</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {/* 설명 */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-toss-gray uppercase tracking-wider px-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="예: 검정 지갑, 주인을 찾습니다."
                  className="w-full px-4 py-3 rounded-xl border border-toss-border focus:border-toss-blue outline-none transition-all font-bold text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-toss-gray bg-toss-lightGray hover:bg-toss-border transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-toss-blue hover:bg-toss-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  등록하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
