"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, deleteImage, getImageUrl } from "@/lib/cloudinary";
import { generateSlug } from "@/lib/utils";
import { Vehicle, VehicleImage } from "@/types/database";

interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  price_usd: number;
  price_gtq: number | null;
  origin_country: string;
  status: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number | null;
  mileage_km: number;
  color: string;
  drive_type: string;
  description: string;
  estimated_arrival: string;
  is_featured: boolean;
  features_raw: string;
}

interface ImageItem {
  id?: string;
  url: string;
  public_id: string;
  is_primary: boolean;
  display_order: number;
  file?: File;
  uploading?: boolean;
  existing?: boolean;
}

const BODY_TYPES = ["SUV", "Sedán", "Pickup", "Hatchback", "Van", "Camioneta", "Coupé"];
const FUEL_TYPES = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"];
const TRANSMISSIONS = ["Automática", "Manual", "CVT"];
const STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "in_transit", label: "En Ruta" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
];

export default function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const router = useRouter();
  const isEdit = !!vehicle;

  const [images, setImages] = useState<ImageItem[]>(
    vehicle?.vehicle_images
      ? [...vehicle.vehicle_images]
          .sort((a, b) => a.display_order - b.display_order)
          .map((img) => ({
            id: img.id,
            url: getImageUrl(img.cloudinary_public_id, "thumb"),
            public_id: img.cloudinary_public_id,
            is_primary: img.is_primary,
            display_order: img.display_order,
            existing: true,
          }))
      : []
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    defaultValues: {
      brand: vehicle?.brand || "",
      model: vehicle?.model || "",
      year: vehicle?.year || new Date().getFullYear(),
      price_usd: vehicle?.price_usd || 0,
      price_gtq: vehicle?.price_gtq || null,
      origin_country: vehicle?.origin_country || "",
      status: vehicle?.status || "available",
      body_type: vehicle?.body_type || "",
      fuel_type: vehicle?.fuel_type || "",
      transmission: vehicle?.transmission || "",
      engine_cc: vehicle?.engine_cc || null,
      mileage_km: vehicle?.mileage_km || 0,
      color: vehicle?.color || "",
      drive_type: vehicle?.drive_type || "",
      description: vehicle?.description || "",
      estimated_arrival: vehicle?.estimated_arrival || "",
      is_featured: vehicle?.is_featured || false,
      features_raw: vehicle?.features?.join(", ") || "",
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageItem[] = acceptedFiles.map((file, i) => ({
      url: URL.createObjectURL(file),
      public_id: "",
      is_primary: images.length === 0 && i === 0,
      display_order: images.length + i,
      file,
      uploading: true,
    }));
    setImages((prev) => [...prev, ...newImages]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      try {
        const { url, public_id } = await uploadImage(acceptedFiles[i]);
        setImages((prev) =>
          prev.map((img) =>
            img.file === acceptedFiles[i]
              ? { ...img, url: getImageUrl(public_id, "thumb"), public_id, uploading: false }
              : img
          )
        );
        toast.success("Imagen subida");
      } catch {
        toast.error(`Error al subir imagen ${i + 1}`);
        setImages((prev) => prev.filter((img) => img.file !== acceptedFiles[i]));
      }
    }
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = async (idx: number) => {
    const img = images[idx];
    if (img.public_id && !img.uploading) {
      try {
        await deleteImage(img.public_id);
        if (img.id) {
          const supabase = createClient();
          await supabase.from("vehicle_images").delete().eq("id", img.id);
        }
      } catch {
        toast.error("Error al eliminar imagen");
        return;
      }
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (img.is_primary && next.length > 0) {
        next[0] = { ...next[0], is_primary: true };
      }
      return next.map((item, i) => ({ ...item, display_order: i }));
    });
  };

  const setPrimary = (idx: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === idx })));
  };

  const onSubmit = async (data: VehicleFormData) => {
    const pendingUploads = images.filter((img) => img.uploading);
    if (pendingUploads.length > 0) {
      toast.error("Esperá a que terminen de subir las imágenes");
      return;
    }

    const supabase = createClient();
    const slug = isEdit ? vehicle!.slug : generateSlug(data.brand, data.model, data.year);

    const vehicleData = {
      brand: data.brand,
      model: data.model,
      year: Number(data.year),
      price_usd: Number(data.price_usd),
      price_gtq: data.price_gtq ? Number(data.price_gtq) : null,
      origin_country: data.origin_country,
      status: data.status,
      body_type: data.body_type,
      fuel_type: data.fuel_type,
      transmission: data.transmission,
      engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
      mileage_km: Number(data.mileage_km),
      color: data.color,
      drive_type: data.drive_type || null,
      description: data.description || null,
      estimated_arrival: data.estimated_arrival || null,
      is_featured: data.is_featured,
      features: data.features_raw
        ? data.features_raw.split(",").map((f) => f.trim()).filter(Boolean)
        : [],
      slug: isEdit ? vehicle!.slug : slug,
      updated_at: new Date().toISOString(),
    };

    try {
      let vehicleId = vehicle?.id;

      if (isEdit) {
        const { error } = await supabase
          .from("vehicles")
          .update(vehicleData)
          .eq("id", vehicleId!);
        if (error) throw error;
      } else {
        const { data: newVehicle, error } = await supabase
          .from("vehicles")
          .insert({ ...vehicleData, created_at: new Date().toISOString() })
          .select()
          .single();
        if (error) throw error;
        vehicleId = newVehicle.id;
      }

      // Upsert images
      const newImages = images.filter((img) => !img.existing && img.public_id);
      for (const img of newImages) {
        await supabase.from("vehicle_images").insert({
          vehicle_id: vehicleId,
          cloudinary_url: img.url,
          cloudinary_public_id: img.public_id,
          is_primary: img.is_primary,
          display_order: img.display_order,
          created_at: new Date().toISOString(),
        });
      }

      // Update existing image primary status
      for (const img of images.filter((i) => i.existing && i.id)) {
        await supabase
          .from("vehicle_images")
          .update({ is_primary: img.is_primary, display_order: img.display_order })
          .eq("id", img.id!);
      }

      toast.success(isEdit ? "Vehículo actualizado" : "Vehículo creado");
      router.push("/admin/vehiculos");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar vehículo");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Basic info */}
      <FormSection title="Información Básica">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <AdminField label="Marca *" error={errors.brand?.message}>
            <AdminInput {...register("brand", { required: "Requerido" })} placeholder="Toyota" />
          </AdminField>
          <AdminField label="Modelo *" error={errors.model?.message}>
            <AdminInput {...register("model", { required: "Requerido" })} placeholder="RAV4" />
          </AdminField>
          <AdminField label="Año *" error={errors.year?.message}>
            <AdminInput
              {...register("year", { required: "Requerido", min: 1990, max: 2030 })}
              type="number"
              placeholder="2023"
            />
          </AdminField>
          <AdminField label="Precio USD *" error={errors.price_usd?.message}>
            <AdminInput
              {...register("price_usd", { required: "Requerido", min: 0 })}
              type="number"
              step="0.01"
              placeholder="12500"
            />
          </AdminField>
          <AdminField label="Precio GTQ">
            <AdminInput
              {...register("price_gtq")}
              type="number"
              step="0.01"
              placeholder="96250"
            />
          </AdminField>
          <AdminField label="País de Origen *" error={errors.origin_country?.message}>
            <AdminInput {...register("origin_country", { required: "Requerido" })} placeholder="USA" />
          </AdminField>
        </div>
      </FormSection>

      {/* Specs */}
      <FormSection title="Especificaciones">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <AdminField label="Carrocería *">
            <AdminSelect {...register("body_type", { required: true })}>
              <option value="">Seleccionar</option>
              {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Combustible *">
            <AdminSelect {...register("fuel_type", { required: true })}>
              <option value="">Seleccionar</option>
              {FUEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Transmisión *">
            <AdminSelect {...register("transmission", { required: true })}>
              <option value="">Seleccionar</option>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Kilometraje *">
            <AdminInput {...register("mileage_km", { required: true })} type="number" placeholder="45000" />
          </AdminField>
          <AdminField label="Motor (cc)">
            <AdminInput {...register("engine_cc")} type="number" placeholder="2000" />
          </AdminField>
          <AdminField label="Color *">
            <AdminInput {...register("color", { required: true })} placeholder="Blanco" />
          </AdminField>
          <AdminField label="Tracción">
            <AdminInput {...register("drive_type")} placeholder="4x4, AWD..." />
          </AdminField>
          <AdminField label="Estado *">
            <AdminSelect {...register("status", { required: true })}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </AdminSelect>
          </AdminField>
          <AdminField label="Fecha estimada llegada">
            <AdminInput {...register("estimated_arrival")} type="date" />
          </AdminField>
        </div>

        <AdminField label="Características (separadas por coma)">
          <AdminInput {...register("features_raw")} placeholder="Bolsas intactas, Bluetooth, Camera trasera" />
        </AdminField>

        <AdminField label="Descripción">
          <textarea
            {...register("description")}
            rows={4}
            className="admin-input resize-none w-full"
            placeholder="Descripción detallada del vehículo..."
          />
        </AdminField>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("is_featured")}
            type="checkbox"
            className="w-4 h-4 accent-flase-red"
          />
          <span className="text-white/70 text-sm font-heading uppercase tracking-wider">
            Vehículo Destacado
          </span>
        </label>
      </FormSection>

      {/* Images */}
      <FormSection title="Imágenes">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-flase-red bg-flase-red/5"
              : "border-white/20 hover:border-flase-red"
          }`}
        >
          <input {...getInputProps()} />
          <svg className="w-8 h-8 text-white/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-white/50 text-sm">
            {isDragActive ? "Soltá las imágenes aquí..." : "Arrastrá o clickeá para subir imágenes"}
          </p>
          <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP — máx. 10MB por imagen</p>
        </div>

        {/* Image grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square bg-flase-navy-deep overflow-hidden">
                {img.uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={img.url}
                    alt={`Imagen ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                )}

                {/* Primary badge */}
                {img.is_primary && (
                  <div className="absolute top-1 left-1 bg-flase-red text-white text-[10px] font-heading font-700 px-1.5 py-0.5">
                    Principal
                  </div>
                )}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(idx)}
                      className="text-white text-xs font-heading uppercase tracking-wider hover:text-flase-red transition-colors"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-white/60 text-xs hover:text-flase-red transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FormSection>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-flase-red hover:bg-flase-red-hover text-white font-heading font-700 uppercase tracking-wider px-8 py-3 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Guardando..." : isEdit ? "Actualizar Vehículo" : "Crear Vehículo"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/vehiculos")}
          className="bg-white/5 hover:bg-white/10 text-white font-heading font-700 uppercase tracking-wider px-8 py-3 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1B1B2F] border border-white/5 p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-4 bg-flase-red" />
        <h2 className="font-heading font-700 text-white uppercase text-sm tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AdminField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-heading font-700 uppercase tracking-wider text-white/40 mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-flase-red text-xs mt-1">{error}</p>}
    </div>
  );
}

function AdminInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#12121F] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-flase-red transition-colors placeholder:text-white/20 ${props.className || ""}`}
    />
  );
}

function AdminSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full bg-[#12121F] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-flase-red transition-colors"
    >
      {children}
    </select>
  );
}
