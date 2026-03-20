import type { Metadata } from "next";
import QuoteForm from "@/components/public/QuoteForm";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";

export const metadata: Metadata = {
  title: "Solicitar Cotización",
  description: "Solicitá una cotización personalizada para el vehículo de tu interés.",
};

async function getAvailableVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, brand, model, year")
    .in("status", ["available", "in_transit"])
    .order("brand");
  return (data as Vehicle[]) || [];
}

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; name?: string }>;
}) {
  const params = await searchParams;
  const vehicles = await getAvailableVehicles();

  return (
    <div className="min-h-screen bg-flase-gray-light">
      <div className="bg-flase-navy py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-12 h-1 bg-flase-red mb-4" />
          <h1 className="font-heading font-900 text-white uppercase text-4xl sm:text-5xl">
            Cotizá
          </h1>
          <p className="text-white/60 mt-2">
            Completá el formulario y te contactamos a la brevedad.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <QuoteForm
          vehicles={vehicles}
          preSelectedVehicleId={params.vehicle}
          preSelectedVehicleName={params.name}
        />
      </div>
    </div>
  );
}
