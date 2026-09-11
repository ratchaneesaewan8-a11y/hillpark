"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tabbar";

// แสดง Header/Footer ของหน้าร้าน ยกเว้นเมื่ออยู่ในหน้า /admin (ให้หลังบ้านมี layout ของตัวเอง)
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <SiteHeader />
      {/* เว้นที่ด้านล่างบนมือถือ ไม่ให้แถบเมนูล่างบังเนื้อหา */}
      <main className="pb-24 lg:pb-0">{children}</main>
      <SiteFooter />
      <MobileTabBar />
    </>
  );
}
