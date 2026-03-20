"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Vehicle } from "@/types/database";

interface AppointmentFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_id: string;
  appointment_type: string;
  preferred_date: string;
  preferred_time: string;
}

const APPOINTMENT_TYPES = [
  { value: "test_drive", label: "Test Drive" },
  { value: "inspection", label: "Inspección" },
  { value: "consultation", label: "Consulta" },
];

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

export default function AppointmentForm({
  vehicles,
  preSelectedVehicleId,
}: {
  vehicles: Vehicle[];
  preSelectedVehicleId?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormData>({
    defaultValues: {
      vehicle_id: preSelectedVehicleId || "",
      appointment_type: "test_drive",
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      toast.success("¡Cita agendada con éxito!");
    } catch {
      toast.error("Ocurrió un error. Intentá nuevamente.");
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 text-center">
        <div className="w-16 h-16 bg-flase-green/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-flase-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="font-heading font-800 text-flase-navy uppercase text-2xl mb-3">
          ¡Cita Agendada!
        </h2>
        <p className="text-flase-gray max-w-md mx-auto">
          Recibimos tu solicitud. Te confirmaremos la cita por teléfono o correo electrónico.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 space-y-6">
      <div className="w-8 h-0.5 bg-flase-red mb-2" />
      <h2 className="font-heading font-800 text-flase-navy uppercase text-xl">
        Información de la Cita
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Nombre completo *" error={errors.customer_name?.message}>
          <input
            {...register("customer_name", { required: "Requerido" })}
            className="form-input"
            placeholder="Tu nombre"
          />
        </FormField>

        <FormField label="Teléfono *" error={errors.customer_phone?.message}>
          <input
            {...register("customer_phone", { required: "Requerido" })}
            className="form-input"
            placeholder="+502 0000-0000"
            type="tel"
          />
        </FormField>

        <FormField label="Correo electrónico *" error={errors.customer_email?.message}>
          <input
            {...register("customer_email", {
              required: "Requerido",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Inválido" },
            })}
            className="form-input"
            placeholder="tu@correo.com"
            type="email"
          />
        </FormField>

        <FormField label="Tipo de cita *" error={errors.appointment_type?.message}>
          <select
            {...register("appointment_type", { required: "Requerido" })}
            className="form-input"
          >
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Fecha preferida *" error={errors.preferred_date?.message}>
          <input
            {...register("preferred_date", {
              required: "Requerido",
              min: { value: today, message: "La fecha debe ser futura" },
            })}
            className="form-input"
            type="date"
            min={today}
          />
        </FormField>

        <FormField label="Hora preferida *" error={errors.preferred_time?.message}>
          <select
            {...register("preferred_time", { required: "Requerido" })}
            className="form-input"
          >
            <option value="">Seleccionar hora</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="Vehículo de interés (opcional)">
        <select {...register("vehicle_id")} className="form-input">
          <option value="">Sin vehículo específico</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} {v.year}
            </option>
          ))}
        </select>
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Agendar Cita"}
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
