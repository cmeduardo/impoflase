import VehicleForm from "@/components/admin/VehicleForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo Vehículo — Admin FLASE" };

export default function NuevoVehiculoPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-800 text-white uppercase text-2xl">Nuevo Vehículo</h1>
        <p className="text-white/40 text-sm mt-0.5">Agregar un vehículo al inventario</p>
      </div>
      <VehicleForm />
    </div>
  );
}
