"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Vehicle } from "@/types/database";

interface QuoteFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nit: string;
  vehicle_id: string;
  message: string;
}

interface QuoteFormProps {
  vehicles: Vehicle[];
  preSelectedVehicleId?: string;
  preSelectedVehicleName?: string;
}

export default function QuoteForm({
  vehicles,
  preSelectedVehicleId,
  preSelectedVehicleName,
}: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    defaultValues: {
      vehicle_id: preSelectedVehicleId || "",
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al enviar la cotización");
      setSubmitted(true);
      toast.success("¡Cotización enviada con éxito!");
    } catch {
      toast.error("Ocurrió un error. Intentá nuevamente.");
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 text-center">
        <div className="w-16 h-16 bg-flase-green/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-flase-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-heading font-800 text-flase-navy uppercase text-2xl mb-3">
          ¡Cotización Enviada!
        </h2>
        <p className="text-flase-gray max-w-md mx-auto">
          Recibimos tu solicitud. Un asesor te contactará a la brevedad para brindarte la información que necesitás.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-8 btn-primary"
        >
          Enviar otra cotización
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-8 space-y-6"
    >
      <div className="w-8 h-0.5 bg-flase-red mb-2" />
      <h2 className="font-heading font-800 text-flase-navy uppercase text-xl">
        Datos de Contacto
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Nombre completo *" error={errors.customer_name?.message}>
          <input
            {...register("customer_name", { required: "Nombre requerido" })}
            className="form-input"
            placeholder="Tu nombre"
          />
        </FormField>

        <FormField label="Teléfono *" error={errors.customer_phone?.message}>
          <input
            {...register("customer_phone", { required: "Teléfono requerido" })}
            className="form-input"
            placeholder="+502 0000-0000"
            type="tel"
          />
        </FormField>

        <FormField label="Correo electrónico *" error={errors.customer_email?.message}>
          <input
            {...register("customer_email", {
              required: "Correo requerido",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Correo inválido" },
            })}
            className="form-input"
            placeholder="tu@correo.com"
            type="email"
          />
        </FormField>

        <FormField label="NIT (opcional)">
          <input
            {...register("customer_nit")}
            className="form-input"
            placeholder="CF o tu NIT"
          />
        </FormField>
      </div>

      <FormField label="Vehículo de interés">
        <select {...register("vehicle_id")} className="form-input">
          <option value="">Seleccionar vehículo (opcional)</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} {v.year}
            </option>
          ))}
        </select>
      </FormField>

      {preSelectedVehicleName && (
        <p className="text-sm text-flase-gray">
          Vehículo pre-seleccionado: <strong className="text-flase-navy">{preSelectedVehicleName}</strong>
        </p>
      )}

      <FormField label="Mensaje (opcional)">
        <textarea
          {...register("message")}
          className="form-input resize-none"
          rows={4}
          placeholder="¿Alguna pregunta o comentario adicional?"
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          "Enviar Cotización"
        )}
      </button>
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-heading font-700 uppercase tracking-wider text-flase-navy mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-flase-red text-xs mt-1">{error}</p>}
    </div>
  );
}
