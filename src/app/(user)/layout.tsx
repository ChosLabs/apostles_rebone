import { BottomNav, GlobalHeader } from "@/components/Navigation";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-background relative shadow-xl pb-24">
      <GlobalHeader />
      <main className="">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
