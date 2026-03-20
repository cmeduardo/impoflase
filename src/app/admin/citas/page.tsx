import { createClient } from "@/lib/supabase/server";
import { Appointment } from "@/types/database";
import AppointmentStatusUpdater from "@/components/admin/AppointmentStatusUpdater";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Citas — Admin FLASE" };

const APPOINTMENT_LABELS: Record<string, string> = {
  test_drive: "Test Drive",
  inspection: "Inspección",
  consultation: "Consulta",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-400/20 text-orange-400",
  confirmed: "bg-flase-green/20 text-flase-green",
  completed: "bg-white/10 text-white/40",
  cancelled: "bg-flase-red/20 text-flase-red",
};

async function getAppointments(status?: string): Promise<Appointment[]> {
  const supabase = await createClient();
  let query = supabase
    .from("appointments")
    .select("*, vehicles(brand, model, year)")
    .order("preferred_date", { ascending: true });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data as Appointment[]) || [];
}

export default async function CitasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const appointments = await getAppointments(params.status);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-800 text-white uppercase text-2xl">Citas</h1>
        <p className="text-white/40 text-sm mt-0.5">{appointments.length} cita{appointments.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "", label: "Todas" },
          { value: "pending", label: "Pendientes" },
          { value: "confirmed", label: "Confirmadas" },
          { value: "completed", label: "Completadas" },
          { value: "cancelled", label: "Canceladas" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={opt.value ? `/admin/citas?status=${opt.value}` : "/admin/citas"}
            className={`px-3 py-2 text-xs font-heading font-700 uppercase tracking-wider transition-colors ${
              params.status === opt.value || (!params.status && !opt.value)
                ? "bg-flase-red text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      <div className="bg-[#1B1B2F] border border-white/5">
        {appointments.length === 0 ? (
          <p className="text-white/30 text-sm px-6 py-16 text-center">No hay citas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Tipo", "Fecha / Hora", "Vehículo", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-heading font-700 uppercase tracking-wider text-white/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-white text-sm font-600">{apt.customer_name}</p>
                      <p className="text-white/40 text-xs">{apt.customer_phone}</p>
                      <a
                        href={`https://wa.me/${apt.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${apt.customer_name}, le contactamos de Importadora FLASE para confirmar su cita.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] text-xs font-heading uppercase mt-0.5 inline-flex items-center gap-1 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-heading font-700 uppercase bg-white/10 text-white/70 px-2 py-1">
                        {APPOINTMENT_LABELS[apt.appointment_type]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm">{apt.preferred_date}</p>
                      <p className="text-white/40 text-xs">{apt.preferred_time}</p>
                    </td>
                    <td className="px-4 py-4">
                      {(apt as any).vehicles ? (
                        <p className="text-white/70 text-sm">
                          {(apt as any).vehicles.brand} {(apt as any).vehicles.model} {(apt as any).vehicles.year}
                        </p>
                      ) : (
                        <p className="text-white/30 text-xs">Sin vehículo</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-heading font-700 uppercase px-2 py-1 ${STATUS_COLORS[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <AppointmentStatusUpdater appointmentId={apt.id} currentStatus={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
