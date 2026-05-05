"use client";

import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

const CONTACTS: { category: string; items: { name: string; role: string; phone: string; icon: any }[] }[] = [];

export default function EmergencyPage() {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/-/g, '')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-white px-5 py-4 flex items-center gap-4 border-b border-toss-border/40">
        <Link href="/" className="p-1 -ml-1 hover:bg-toss-lightGray rounded-full transition-colors">
          <ArrowLeft size={24} className="text-toss-black" />
        </Link>
        <h1 className="text-lg font-bold text-toss-black">비상 연락처</h1>
      </header>

      <main className="p-4 flex flex-col gap-8 mt-2">
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-start gap-4">
          <div className="bg-red-500 text-white p-2 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-red-600 mb-1">비상 시 대처 요령</h2>
            <p className="text-xs text-red-500/80 leading-relaxed font-medium">
              사고 발생 시 즉시 상황실이나 의료팀에 연락해주세요. 본인의 위치와 상황을 정확히 전달해주시기 바랍니다.
            </p>
          </div>
        </div>

        {CONTACTS.map((section, idx) => (
          <section key={idx} className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-toss-gray px-1 uppercase tracking-wider">{section.category}</h3>
            <div className="flex flex-col gap-2">
              {section.items.map((contact, cIdx) => (
                <div 
                  key={cIdx}
                  onClick={() => handleCall(contact.phone)}
                  className="bg-white p-4 rounded-toss shadow-sm border border-toss-border/40 flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-toss-lightGray flex items-center justify-center shrink-0">
                      {contact.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-toss-black leading-tight">{contact.name}</span>
                        <span className="text-[10px] font-bold bg-toss-lightGray text-toss-gray px-1.5 py-0.5 rounded uppercase">{contact.role}</span>
                      </div>
                      <p className="text-xs text-toss-gray mt-0.5">{contact.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8 text-center pb-8">
          <p className="text-[11px] text-toss-gray/60 font-medium">
            긴급 신고: 경찰서(112), 소방서(119)
          </p>
        </div>
      </main>
    </div>
  );
}
