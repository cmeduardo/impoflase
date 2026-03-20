import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";
import { formatPrice, getStatusLabel, getStatusColor, formatDate, buildWhatsAppUrl } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary";
import VehicleGallery from "@/components/public/VehicleGallery";
import VehicleCard from "@/components/public/VehicleCard";
import type { Metadata } from "next";

export const revalidate = 60;

async function getVehicle(slug: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("slug", slug)
    .single();
  return data as Vehicle | null;
}

async function getSimilarVehicles(vehicle: Vehicle): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("body_type", vehicle.body_type)
    .neq("id", vehicle.id)
    .neq("status", "sold")
    .limit(3);
  return (data as Vehicle[]) || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) return { title: "Vehículo no encontrado" };

  const primaryImage = vehicle.vehicle_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage
    ? getImageUrl(primaryImage.cloudinary_public_id, "catalog")
    : undefined;

  return {
    title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.color} — ${vehicle.body_type} — ${vehicle.price_gtq ? formatPrice(vehicle.price_gtq, "GTQ") : formatPrice(vehicle.price_usd, "USD")}`,
    openGraph: {
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

const SPEC_LABELS: Record<string, string> = {
  year: "Año",
  brand: "Marca",
  model: "Modelo",
  body_type: "Carrocería",
  color: "Color",
  mileage_km: "Kilometraje",
  fuel_type: "Combustible",
  transmission: "Transmisión",
  engine_cc: "Motor (cc)",
  drive_type: "Tracción",
  origin_country: "País de Origen",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  const similar = await getSimilarVehicles(vehicle);
  const whatsappMsg = `Hola, estoy interesado en el ${vehicle.brand} ${vehicle.model} ${vehicle.year} que vi en su sitio web. ¿Podría darme más información?`;
  const whatsappUrl = buildWhatsAppUrl("50200000000", whatsappMsg);

  const specs = [
    { label: "Año", value: vehicle.year },
    { label: "Marca", value: vehicle.brand },
    { label: "Modelo", value: vehicle.model },
    { label: "Carrocería", value: vehicle.body_type },
    { label: "Color", value: vehicle.color },
    { label: "Kilometraje", value: `${vehicle.mileage_km.toLocaleString()} km` },
    { label: "Combustible", value: vehicle.fuel_type },
    { label: "Transmisión", value: vehicle.transmission },
    ...(vehicle.engine_cc ? [{ label: "Motor", value: `${vehicle.engine_cc} cc` }] : []),
    ...(vehicle.drive_type ? [{ label: "Tracción", value: vehicle.drive_type }] : []),
    { label: "País de Origen", value: vehicle.origin_country },
  ];

  return (
    <div className="min-h-screen bg-flase-gray-light">
      {/* Breadcrumb */}
      <div className="bg-flase-navy py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm">
          <Link href="/" className="text-white/50 hover:text-white transition-colors">Inicio</Link>
          <span className="text-white/30">/</span>
          <Link href="/vehiculos" className="text-white/50 hover:text-white transition-colors">Catálogo</Link>
          <span className="text-white/30">/</span>
          <span className="text-white/80 truncate">{vehicle.brand} {vehicle.model} {vehicle.year}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Gallery */}
          <div className="lg:col-span-2">
            <VehicleGallery images={vehicle.vehicle_images || []} vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`} />
          </div>

          {/* Right: Info */}
          <div className="space-y-5">
            {/* Status & Title */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`status-badge ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status === "in_transit" ? "Próximo Ingreso" : getStatusLabel(vehicle.status)}
                </span>
                {vehicle.estimated_arrival && vehicle.status === "in_transit" && (
                  <span className="text-xs text-flase-gray">
                    Llegada: {formatDate(vehicle.estimated_arrival)}
                  </span>
                )}
              </div>
              <h1 className="font-heading font-900 text-flase-navy uppercase text-3xl leading-tight">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-flase-gray text-lg mt-1">{vehicle.year}</p>
            </div>

            {/* Price */}
            <div className="bg-flase-navy p-5">
              <div className="w-8 h-0.5 bg-flase-red mb-3" />
              {vehicle.price_gtq ? (
                <>
                  <p className="font-heading font-900 text-flase-red text-3xl">
                    {formatPrice(vehicle.price_gtq, "GTQ")}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    {formatPrice(vehicle.price_usd, "USD")}
                  </p>
                </>
              ) : (
                <p className="font-heading font-900 text-white text-3xl">
                  {formatPrice(vehicle.price_usd, "USD")}
                </p>
              )}
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span
                    key={f}
                    className="text-xs font-heading font-700 uppercase tracking-wider bg-flase-navy text-white px-3 py-1"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href={`/cotizar?vehicle=${vehicle.id}&name=${encodeURIComponent(`${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}`}
                className="btn-primary w-full justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Solicitar Cotización
              </Link>
              <Link
                href={`/citas?vehicle=${vehicle.id}`}
                className="btn-outline w-full justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agendar Cita
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20B954] text-white font-heading font-700 uppercase tracking-wider py-3 px-6 flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Specs + Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Specs */}
            <div className="bg-white p-6">
              <div className="w-8 h-0.5 bg-flase-red mb-4" />
              <h2 className="font-heading font-800 text-flase-navy uppercase text-xl mb-6">
                Especificaciones
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map(({ label, value }) => (
                  <div key={label} className="border-b border-flase-gray-light pb-3">
                    <dt className="text-xs font-heading font-700 uppercase tracking-wider text-flase-gray mb-1">
                      {label}
                    </dt>
                    <dd className="text-flase-navy font-600 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white p-6">
                <div className="w-8 h-0.5 bg-flase-red mb-4" />
                <h2 className="font-heading font-800 text-flase-navy uppercase text-xl mb-4">
                  Descripción
                </h2>
                <p className="text-flase-gray leading-relaxed">{vehicle.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Similar Vehicles */}
        {similar.length > 0 && (
          <div className="mt-16">
            <div className="w-8 h-0.5 bg-flase-red mb-4" />
            <h2 className="section-title text-2xl sm:text-3xl mb-8">
              Vehículos Similares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
