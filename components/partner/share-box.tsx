"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ShareBox({ link, code }: { link: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(link);
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${enc}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* QR */}
      <div className="shrink-0 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR ลิงก์แนะนำ" width={140} height={140} className="rounded-xl border border-black/5" />
        <a
          href={qr}
          download={`hillpark-ref-${code}.png`}
          className="mt-2 inline-block text-xs font-medium text-brand-orange hover:underline"
        >
          ดาวน์โหลด QR
        </a>
      </div>

      {/* ลิงก์ + คัดลอก + แชร์ */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-xl border border-black/10 bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>
        <div className="mt-2 text-xs text-brand-text/50">
          โค้ดแนะนำของคุณ: <b className="text-brand-text">{code}</b>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`https://social-plugins.line.me/lineit/share?url=${enc}`} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-[#06C755] px-3 py-1.5 text-xs font-semibold text-white">แชร์ LINE</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-[#1877F2] px-3 py-1.5 text-xs font-semibold text-white">แชร์ Facebook</a>
          <a href={`https://wa.me/?text=${enc}`} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">แชร์ WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
