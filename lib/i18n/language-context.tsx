"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "th" | "en";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "hillpark-lang";

// ครอบทั้งแอปใน app/layout.tsx — เก็บภาษาที่เลือกไว้ใน localStorage ของเบราว์เซอร์
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "th" || saved === "en") setLangState(saved);
    } catch {
      // ไม่มี localStorage (private mode ฯลฯ) — ใช้ค่าเริ่มต้นไทยไป
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  function toggleLang() {
    setLang(lang === "th" ? "en" : "th");
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage ต้องถูกใช้ภายใน <LanguageProvider>");
  return ctx;
}

// คอมโพเนนต์ช่วยแสดงข้อความ 2 ภาษา ใช้ได้แม้ในไฟล์ Server Component
// (เพราะตัวมันเองเป็น client component ที่อ่าน context)
export function T({ th, en }: { th: string; en: string }) {
  const { lang } = useLanguage();
  return <>{lang === "en" ? en : th}</>;
}
