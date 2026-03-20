import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";
import VehicleCard from "@/components/public/VehicleCard";
import VehicleFilters from "@/components/public/VehicleFilters";
import SortSelect from "@/components/public/SortSelect";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Vehículos",
  description: "Explorá nuestro catálogo completo de vehículos importados disponibles en Guatemala.",
};

export const revalidate = 60;

async function getVehicles(searchParams: Record<string, string>): Promise<{
  vehicles: Vehicle[];
  total: number;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("vehicles")
    .select("*, vehicle_images(*)", { count: "exact" });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.body_type) {
    query = query.eq("body_type", searchParams.body_type);
  }
  if (searchParams.fuel_type) {
    query = query.eq("fuel_type", searchParams.fuel_type);
  }
  if (searchParams.transmission) {
    query = query.eq("transmission", searchParams.transmission);
  }
  if (searchParams.year) {
    query = query.eq("year", parseInt(searchParams.year));
  }
  if (searchParams.max_price) {
    query = query.lte("price_gtq", parseInt(searchParams.max_price));
  }

  // Sort
  const sort = searchParams.sort || "created_at-desc";
  const [sortField, sortDir] = sort.split("-");
  query = query.order(sortField, { ascending: sortDir === "asc" });

  // Pagination
  const page = parseInt(searchParams.page || "1");
  const perPage = 12;
  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count } = await query;
  return { vehicles: (data as Vehicle[]) || [], total: count || 0 };
}

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { vehicles, total } = await getVehicles(params);
  const page = parseInt(params.page || "1");
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-flase-gray-light">
      {/* Header */}
      <div className="bg-flase-navy py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-12 h-1 bg-flase-red mb-4" />
          <h1 className="font-heading font-900 text-white uppercase text-4xl sm:text-5xl">
            Catálogo
          </h1>
          <p className="text-white/60 mt-2">
            {total} vehículo{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="h-64 bg-white animate-pulse" />}>
              <VehicleFilters />
            </Suspense>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Sort */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-flase-gray text-sm">
                Mostrando{" "}
                <span className="text-flase-navy font-600">
                  {vehicles.length}
                </span>{" "}
                de <span className="text-flase-navy font-600">{total}</span>
              </p>
              <Suspense>
                <SortSelect current={params.sort} />
              </Suspense>
            </div>

            {vehicles.length === 0 ? (
              <div className="bg-white p-16 text-center">
                <div className="w-12 h-12 border-2 border-flase-gray-light flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-flase-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-700 text-flase-navy uppercase text-lg mb-2">
                  No hay resultados
                </h3>
                <p className="text-flase-gray text-sm">
                  Probá ajustando los filtros.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Suspense>
                    <Pagination
                      current={page}
                      total={totalPages}
                      params={params}
                    />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  params,
}: {
  current: number;
  total: number;
  params: Record<string, string>;
}) {
  const getUrl = (page: number) => {
    const p = new URLSearchParams(params);
    p.set("page", String(page));
    return `/vehiculos?${p.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {current > 1 && (
        <a
          href={getUrl(current - 1)}
          className="w-10 h-10 border border-flase-navy flex items-center justify-center text-flase-navy hover:bg-flase-navy hover:text-white transition-colors"
        >
          ‹
        </a>
      )}
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <a
          key={page}
          href={getUrl(page)}
          className={`w-10 h-10 border flex items-center justify-center text-sm font-heading font-700 transition-colors ${
            page === current
              ? "bg-flase-red border-flase-red text-white"
              : "border-flase-gray-light text-flase-navy hover:border-flase-navy"
          }`}
        >
          {page}
        </a>
      ))}
      {current < total && (
        <a
          href={getUrl(current + 1)}
          className="w-10 h-10 border border-flase-navy flex items-center justify-center text-flase-navy hover:bg-flase-navy hover:text-white transition-colors"
        >
          ›
        </a>
      )}
    </div>
  );
}
