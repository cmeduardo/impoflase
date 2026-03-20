import type { Metadata } from "next";
import AppointmentForm from "@/components/public/AppointmentForm";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";

export const metadata: Metadata = {
  title: "Agendar Cita",
  description: "Agendá una cita para test drive, inspección o consulta.",
};

async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, brand, model, year")
    .in("status", ["available", "in_transit"])
    .order("brand");
  return (data as Vehicle[]) || [];
}

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const params = await searchParams;
  const vehicles = await getVehicles();

  return (
    <div className="min-h-screen bg-flase-gray-light">
      <div className="bg-flase-navy py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-12 h-1 bg-flase-red mb-4" />
          <h1 className="font-heading font-900 text-white uppercase text-4xl sm:text-5xl">
            Agendar Cita
          </h1>
          <p className="text-white/60 mt-2">
            Elegí fecha y tipo de cita. Te confirmaremos a la brevedad.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AppointmentForm vehicles={vehicles} preSelectedVehicleId={params.vehicle} />
      </div>
    </div>
  );
}
