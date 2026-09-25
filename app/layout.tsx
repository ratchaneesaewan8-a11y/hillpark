import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { RefCapture } from "@/components/ref-capture";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "HILLPARK ADVENTURE — Good Trips, Great Memories",
  description:
    "จองทัวร์และกิจกรรมท่องเที่ยว เกาะ ดำน้ำ คายัค ATV Zipline จองง่าย เที่ยวได้จริง ชำระเงินปลอดภัยผ่าน Stripe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.variable}>
      <body className="font-sans">
        <LanguageProvider>
          <RefCapture />
          <SiteChrome>{children}</SiteChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
