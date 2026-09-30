"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteGalleryImageFromPage } from "@/app/admin/(panel)/tours/actions";

export function DeleteGalleryImageButton({ tourId, imageId }: { tourId: string; imageId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function removeImage() {
    if (!window.confirm("ต้องการลบรูปนี้ออกจากแกลเลอรีใช่ไหม?")) return;
    setError("");
    startTransition(async () => {
      const result = await deleteGalleryImageFromPage(tourId, imageId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" onClick={removeImage} disabled={pending} title="ลบรูปนี้" className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white disabled:opacity-60">
        <Trash2 size={14} />
      </button>
      {error && <p className="absolute left-0 top-full z-10 mt-2 w-48 rounded-lg bg-red-50 p-2 text-xs text-red-600 shadow-soft">{error}</p>}
    </>
  );
}
