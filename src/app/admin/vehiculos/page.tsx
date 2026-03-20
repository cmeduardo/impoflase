import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Vehicle } from "@/types/database";
import { formatPrice, getStatusLabel, getStatusColor } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary";
import DeleteVehicleButton from "@/components/admin/DeleteVehicleButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vehículos — Admin FLASE" };

async function getVehicles(search?: string): Promise<Vehicle[]> {
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%`);
  }

  const { data } = await query;
  return (data as Vehicle[]) || [];
}

export default async function AdminVehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const vehicles = await getVehicles(params.search);

  const filtered = params.status
    ? vehicles.filter((v) => v.status === params.status)
    : vehicles;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-800 text-white uppercase text-2xl">Vehículos</h1>
          <p className="text-white/40 text-sm mt-0.5">{filtered.length} vehículo{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/vehiculos/nuevo"
          className="bg-flase-red hover:bg-flase-red-hover text-white font-heading font-700 uppercase text-xs tracking-wider px-5 py-2.5 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Vehículo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form method="get" className="flex gap-2">
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Buscar marca, modelo..."
            className="bg-[#1B1B2F] border border-white/10 text-white text-sm px-4 py-2 focus:outline-none focus:border-flase-red w-64 placeholder:text-white/30"
          />
          <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm transition-colors">
            Buscar
          </button>
        </form>

        <div className="flex gap-2">
          {[
            { value: "", label: "Todos" },
            { value: "available", label: "Disponibles" },
            { value: "in_transit", label: "En Ruta" },
            { value: "reserved", label: "Reservados" },
            { value: "sold", label: "Vendidos" },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={opt.value ? `/admin/vehiculos?status=${opt.value}` : "/admin/vehiculos"}
              className={`px-3 py-2 text-xs font-heading font-700 uppercase tracking-wider transition-colors ${
                params.status === opt.value || (!params.status && opt.value === "")
                  ? "bg-flase-red text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1B1B2F] border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-white/30 text-sm">No hay vehículos.</p>
            <Link href="/admin/vehiculos/nuevo" className="mt-4 inline-block text-flase-red text-sm font-heading uppercase tracking-wider hover:underline">
              Agregar el primero
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Imagen", "Vehículo", "Año", "Precio", "Estado", "Destacado", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-heading font-700 uppercase tracking-wider text-white/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((vehicle) => {
                  const primary = vehicle.vehicle_images?.find((i) => i.is_primary);
                  const imgUrl = primary ? getImageUrl(primary.cloudinary_public_id, "thumb") : null;

                  return (
                    <tr key={vehicle.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="w-16 h-12 bg-flase-navy-deep overflow-hidden flex-shrink-0">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              width={64}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-600 text-sm">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-white/40 text-xs">{vehicle.body_type} · {vehicle.color}</p>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-sm">{vehicle.year}</td>
                      <td className="px-4 py-3">
                        {vehicle.price_gtq && (
                          <p className="text-white text-sm font-600">{formatPrice(vehicle.price_gtq, "GTQ")}</p>
                        )}
                        <p className="text-white/40 text-xs">{formatPrice(vehicle.price_usd, "USD")}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge text-[10px] ${getStatusColor(vehicle.status)}`}>
                          {getStatusLabel(vehicle.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {vehicle.is_featured ? (
                          <span className="text-yellow-400 text-lg">★</span>
                        ) : (
                          <span className="text-white/20 text-lg">☆</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/vehiculos/${vehicle.id}/editar`}
                            className="text-flase-blue hover:text-white text-xs font-heading uppercase tracking-wider transition-colors"
                          >
                            Editar
                          </Link>
                          <span className="text-white/20">|</span>
                          <Link
                            href={`/vehiculos/${vehicle.slug}`}
                            target="_blank"
                            className="text-white/40 hover:text-white text-xs font-heading uppercase tracking-wider transition-colors"
                          >
                            Ver
                          </Link>
                          <span className="text-white/20">|</span>
                          <DeleteVehicleButton vehicleId={vehicle.id} vehicleName={`${vehicle.brand} ${vehicle.model}`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
