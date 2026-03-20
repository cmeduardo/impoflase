"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function DeleteVehicleButton({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${vehicleName}"? Esta acción no se puede deshacer.`)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
      if (error) throw error;
      toast.success("Vehículo eliminado");
      router.refresh();
    } catch {
      toast.error("Error al eliminar vehículo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-flase-red/60 hover:text-flase-red text-xs font-heading uppercase tracking-wider transition-colors disabled:opacity-40"
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
