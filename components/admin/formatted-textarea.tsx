"use client";

import { useState } from "react";

function formattedClipboardText(html: string, text: string) {
  if (!html) return text;
  const documentFragment = document.createElement("div");
  documentFragment.innerHTML = html;
  // innerText เก็บการเว้นบรรทัดจากย่อหน้า หัวข้อ และรายการ โดยไม่บันทึก HTML ที่ไม่ปลอดภัย
  return documentFragment.innerText || text;
}

export function FormattedTextarea({ name, defaultValue = "", rows = 6, placeholder }: { name: string; defaultValue?: string; rows?: number; placeholder?: string }) {
  const [value, setValue] = useState(defaultValue);

  return <textarea
    name={name}
    rows={rows}
    value={value}
    placeholder={placeholder}
    className="input"
    onChange={(event) => setValue(event.target.value)}
    onPaste={(event) => {
      const html = event.clipboardData.getData("text/html");
      if (!html) return;
      event.preventDefault();
      const pasted = formattedClipboardText(html, event.clipboardData.getData("text/plain"));
      const target = event.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const next = `${value.slice(0, start)}${pasted}${value.slice(end)}`;
      setValue(next);
      requestAnimationFrame(() => {
        const cursor = start + pasted.length;
        target.setSelectionRange(cursor, cursor);
      });
    }}
  />;
}
