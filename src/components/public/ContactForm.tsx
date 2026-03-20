"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // In a real implementation, this would send to an API route
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    toast.success("¡Mensaje enviado con éxito!");
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 text-center">
        <div className="w-16 h-16 bg-flase-green/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-flase-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-heading font-800 text-flase-navy uppercase text-2xl mb-2">
          ¡Mensaje Enviado!
        </h2>
        <p className="text-flase-gray">Te contactaremos pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 space-y-5">
      <div className="w-8 h-0.5 bg-flase-red mb-2" />
      <h2 className="font-heading font-800 text-flase-navy uppercase text-xl">
        Envianos un Mensaje
      </h2>

      {[
        { name: "name" as const, label: "Nombre *", placeholder: "Tu nombre", type: "text", required: true },
        { name: "email" as const, label: "Correo *", placeholder: "tu@correo.com", type: "email", required: true },
        { name: "phone" as const, label: "Teléfono", placeholder: "+502 0000-0000", type: "tel", required: false },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-xs font-heading font-700 uppercase tracking-wider text-flase-navy mb-2">
            {field.label}
          </label>
          <input
            {...register(field.name, field.required ? { required: "Requerido" } : {})}
            type={field.type}
            placeholder={field.placeholder}
            className="form-input"
          />
          {errors[field.name] && (
            <p className="text-flase-red text-xs mt-1">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-xs font-heading font-700 uppercase tracking-wider text-flase-navy mb-2">
          Mensaje *
        </label>
        <textarea
          {...register("message", { required: "Requerido" })}
          rows={5}
          className="form-input resize-none"
          placeholder="¿En qué podemos ayudarte?"
        />
        {errors.message && <p className="text-flase-red text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center py-4 disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
      </button>
    </form>
  );
}
