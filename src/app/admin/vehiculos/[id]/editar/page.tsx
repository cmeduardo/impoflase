import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";
import VehicleForm from "@/components/admin/VehicleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar Vehículo — Admin FLASE" };

async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("id", id)
    .single();
  return data as Vehicle | null;
}

export default async function EditarVehiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-800 text-white uppercase text-2xl">
          Editar Vehículo
        </h1>
        <p className="text-white/40 text-sm mt-0.5">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
      </div>
      <VehicleForm vehicle={vehicle} />
    </div>
  );
}
