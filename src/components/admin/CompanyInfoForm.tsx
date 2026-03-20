"use client";

import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { CompanyInfo } from "@/types/database";

export default function CompanyInfoForm({ initialData }: { initialData: CompanyInfo | null }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      company_name: initialData?.company_name || "Importadora FLASE",
      whatsapp_number: initialData?.whatsapp_number || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      google_maps_url: initialData?.google_maps_url || "",
      facebook_url: initialData?.facebook_url || "",
      instagram_url: initialData?.instagram_url || "",
      tiktok_url: initialData?.tiktok_url || "",
      youtube_url: initialData?.youtube_url || "",
      about_text: initialData?.about_text || "",
      phone_numbers_raw: initialData?.phone_numbers?.join(", ") || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const supabase = createClient();
      const payload = {
        company_name: data.company_name,
        whatsapp_number: data.whatsapp_number,
        email: data.email,
        address: data.address,
        google_maps_url: data.google_maps_url || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        tiktok_url: data.tiktok_url || null,
        youtube_url: data.youtube_url || null,
        about_text: data.about_text || null,
        phone_numbers: data.phone_numbers_raw
          ? data.phone_numbers_raw.split(",").map((p: string) => p.trim()).filter(Boolean)
          : [],
        business_hours: {
          "Lunes – Viernes": "8:00 – 18:00",
          "Sábado": "8:00 – 14:00",
          "Domingo": "Cerrado",
        },
      };

      if (initialData) {
        await supabase.from("company_info").update(payload).eq("id", 1);
      } else {
        await supabase.from("company_info").insert({ id: 1, ...payload });
      }

      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    }
  };

  const fields = [
    { name: "company_name", label: "Nombre de la empresa *" },
    { name: "phone_numbers_raw", label: "Teléfonos (separados por coma)" },
    { name: "whatsapp_number", label: "WhatsApp (con código país)" },
    { name: "email", label: "Correo electrónico" },
    { name: "address", label: "Dirección" },
    { name: "google_maps_url", label: "URL Google Maps" },
    { name: "facebook_url", label: "Facebook URL" },
    { name: "instagram_url", label: "Instagram URL" },
    { name: "tiktok_url", label: "TikTok URL" },
    { name: "youtube_url", label: "YouTube URL" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="bg-[#1B1B2F] border border-white/5 p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-4 bg-flase-red" />
          <h2 className="font-heading font-700 text-white uppercase text-sm tracking-widest">
            Datos de Contacto
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-heading font-700 uppercase tracking-wider text-white/40 mb-2">
                {field.label}
              </label>
              <input
                {...register(field.name as any)}
                className="w-full bg-[#12121F] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-flase-red transition-colors placeholder:text-white/20"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-heading font-700 uppercase tracking-wider text-white/40 mb-2">
            Texto &quot;Sobre Nosotros&quot;
          </label>
          <textarea
            {...register("about_text")}
            rows={5}
            className="w-full bg-[#12121F] border border-white/10 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-flase-red transition-colors resize-none"
            placeholder="Historia y descripción de la empresa..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-flase-red hover:bg-flase-red-hover text-white font-heading font-700 uppercase tracking-wider px-8 py-3 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? "Guardando..." : "Guardar Configuración"}
      </button>
    </form>
  );
}
