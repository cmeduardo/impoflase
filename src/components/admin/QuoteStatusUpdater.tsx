"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { QuoteStatus } from "@/types/database";

const STATUSES: { value: QuoteStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "contacted", label: "Contactado" },
  { value: "quoted", label: "Cotizado" },
  { value: "closed", label: "Cerrado" },
];

export default function QuoteStatusUpdater({
  quoteId,
  currentStatus,
}: {
  quoteId: string;
  currentStatus: QuoteStatus;
}) {
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const updateStatus = async (status: QuoteStatus) => {
    setUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("quotes")
        .update({ status })
        .eq("id", quoteId);
      if (error) throw error;
      toast.success("Estado actualizado");
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => updateStatus(e.target.value as QuoteStatus)}
      disabled={updating}
      className="bg-[#12121F] border border-white/10 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-flase-red transition-colors disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
