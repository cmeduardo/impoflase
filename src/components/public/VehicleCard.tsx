import Link from "next/link";
import Image from "next/image";
import { Vehicle } from "@/types/database";
import { formatPrice, getStatusLabel, getStatusColor } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const primaryImage = vehicle.vehicle_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage
    ? getImageUrl(primaryImage.cloudinary_public_id, "thumb")
    : "/placeholder-car.svg";

  const isSold = vehicle.status === "sold";

  return (
    <Link href={`/vehiculos/${vehicle.slug}`} className="block group">
      <article className="card-vehicle bg-white">
        {/* Image container */}
        <div className="relative overflow-hidden aspect-[4/3] bg-flase-gray-light">
          <Image
            src={imageUrl}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSold ? "grayscale opacity-60" : ""
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`status-badge ${getStatusColor(vehicle.status)}`}>
              {getStatusLabel(vehicle.status)}
            </span>
          </div>

          {/* Featured badge */}
          {vehicle.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="status-badge bg-flase-navy text-white">
                Destacado
              </span>
            </div>
          )}

          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-flase-red/90 px-8 py-3 rotate-[-15deg]">
                <span className="font-heading font-900 text-white text-2xl uppercase tracking-widest">
                  Vendido
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info bar - styled like FLASE social posts */}
        <div className="bg-flase-navy p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-800 text-white uppercase text-base leading-tight truncate">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-white/60 text-sm mt-0.5">
                {vehicle.year} · {vehicle.body_type} · {vehicle.transmission}
              </p>
            </div>
            {vehicle.status === "in_transit" && (
              <div className="flex-shrink-0">
                <span className="text-[10px] font-heading font-700 uppercase tracking-wider bg-flase-blue text-white px-2 py-1 whitespace-nowrap">
                  Próx. Ingreso
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              {vehicle.price_gtq && (
                <p className="text-flase-red font-heading font-800 text-lg">
                  {formatPrice(vehicle.price_gtq, "GTQ")}
                </p>
              )}
              <p className={`text-sm ${vehicle.price_gtq ? "text-white/50" : "text-white font-700"}`}>
                {formatPrice(vehicle.price_usd, "USD")}
              </p>
            </div>
            <div className="w-8 h-8 border border-flase-red flex items-center justify-center group-hover:bg-flase-red transition-colors duration-200">
              <svg className="w-4 h-4 text-flase-red group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Red accent line at bottom */}
        <div className="h-0.5 bg-flase-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </article>
    </Link>
  );
}
