"use client";

import { useState } from "react";
import Image from "next/image";
import { VehicleImage } from "@/types/database";
import { getImageUrl } from "@/lib/cloudinary";

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export default function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (sorted.length === 0) {
    return (
      <div className="aspect-[4/3] bg-flase-gray-light flex items-center justify-center">
        <svg className="w-16 h-16 text-flase-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const activeImage = sorted[activeIdx];
  const mainUrl = getImageUrl(activeImage.cloudinary_public_id, "detail");

  return (
    <>
      {/* Main image */}
      <div
        className="relative aspect-[4/3] bg-flase-navy cursor-zoom-in overflow-hidden group"
        onClick={() => setLightbox(true)}
      >
        <Image
          src={mainUrl}
          alt={`${vehicleName} — imagen ${activeIdx + 1}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-heading px-2 py-1">
          {activeIdx + 1} / {sorted.length}
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-heading px-2 py-1">
          ⤢ Ampliar
        </div>
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex-shrink-0 w-20 h-16 overflow-hidden border-2 transition-all duration-200 ${
                idx === activeIdx
                  ? "border-flase-red"
                  : "border-transparent hover:border-flase-gray"
              }`}
            >
              <Image
                src={getImageUrl(img.cloudinary_public_id, "thumb")}
                alt={`${vehicleName} — thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          {activeIdx > 0 && (
            <button
              className="absolute left-4 text-white/60 hover:text-white text-3xl"
              onClick={(e) => { e.stopPropagation(); setActiveIdx(i => i - 1); }}
            >
              ‹
            </button>
          )}
          {activeIdx < sorted.length - 1 && (
            <button
              className="absolute right-4 text-white/60 hover:text-white text-3xl"
              onClick={(e) => { e.stopPropagation(); setActiveIdx(i => i + 1); }}
            >
              ›
            </button>
          )}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={mainUrl}
              alt={vehicleName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
