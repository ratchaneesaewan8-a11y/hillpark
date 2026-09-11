"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, X } from "lucide-react";

// อัปโหลดรูปขึ้น Supabase Storage (bucket "tours") แล้วเก็บ public URL ไว้ใน hidden input
export function ImageUpload({
  name,
  defaultValue = "",
  label = "รูปภาพ",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("tours").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("tours").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err: any) {
      setError("อัปโหลดไม่สำเร็จ: " + (err?.message ?? "ตรวจสอบ bucket 'tours' และสิทธิ์"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-32 w-48 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 text-brand-text/50 hover:border-brand-orange">
          <UploadCloud size={22} />
          <span className="text-xs">{uploading ? "กำลังอัปโหลด..." : "เลือกรูป"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
