import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Admin FLASE" };

async function getDashboardData() {
  const supabase = await createClient();

  const [vehicles, quotes, appointments] = await Promise.all([
    supabase.from("vehicles").select("id, status, created_at"),
    supabase.from("quotes").select("id, status, created_at, customer_name, customer_phone").order("created_at", { ascending: false }).limit(5),
    supabase.from("appointments").select("id, status, preferred_date, customer_name, appointment_type").order("preferred_date", { ascending: true }).limit(5),
  ]);

  const vehiclesData = vehicles.data || [];
  const counts = {
    available: vehiclesData.filter((v) => v.status === "available").length,
    in_transit: vehiclesData.filter((v) => v.status === "in_transit").length,
    reserved: vehiclesData.filter((v) => v.status === "reserved").length,
    sold: vehiclesData.filter((v) => v.status === "sold").length,
    total: vehiclesData.length,
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonth = vehiclesData.filter((v) => v.created_at >= monthStart).length;

  const pendingQuotes = (quotes.data || []).filter((q) => q.status === "pending").length;
  const pendingAppointments = (appointments.data || []).filter((a) => a.status === "pending").length;

  return {
    counts: { ...counts, thisMonth },
    pendingQuotes,
    pendingAppointments,
    recentQuotes: quotes.data || [],
    upcomingAppointments: appointments.data || [],
  };
}

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  in_transit: "En Ruta",
  reserved: "Reservado",
  sold: "Vendido",
  pending: "Pendiente",
  contacted: "Contactado",
  quoted: "Cotizado",
  closed: "Cerrado",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  test_drive: "Test Drive",
  inspection: "Inspección",
  consultation: "Consulta",
};

export default async function AdminDashboard() {
  const { counts, pendingQuotes, pendingAppointments, recentQuotes, upcomingAppointments } =
    await getDashboardData();

  const kpis = [
    { label: "Disponibles", value: counts.available, color: "text-flase-green", bg: "bg-flase-green/10" },
    { label: "En Ruta", value: counts.in_transit, color: "text-flase-blue", bg: "bg-flase-blue/10" },
    { label: "Reservados", value: counts.reserved, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Vendidos", value: counts.sold, color: "text-flase-red", bg: "bg-flase-red/10" },
    { label: "Total", value: counts.total, color: "text-white", bg: "bg-white/5" },
    { label: "Este Mes", value: counts.thisMonth, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Cotiz. Pendientes", value: pendingQuotes, color: "text-orange-400", bg: "bg-orange-400/10" },
    { label: "Citas Pendientes", value: pendingAppointments, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-800 text-white uppercase text-2xl">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">Panel de control — Importadora FLASE</p>
        </div>
        <Link
          href="/admin/vehiculos/nuevo"
          className="bg-flase-red hover:bg-flase-red-hover text-white font-heading font-700 uppercase text-xs tracking-wider px-5 py-2.5 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Vehículo
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} border border-white/5 p-5`}>
            <p className={`font-heading font-900 text-3xl ${kpi.color}`}>{kpi.value}</p>
            <p className="text-white/40 text-xs uppercase tracking-wider mt-1 font-heading">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent quotes */}
        <div className="bg-[#1B1B2F] border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="font-heading font-700 text-white text-sm uppercase tracking-wider">
              Últimas Cotizaciones
            </h2>
            <Link href="/admin/cotizaciones" className="text-flase-red text-xs font-heading uppercase tracking-wider hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentQuotes.length === 0 ? (
              <p className="text-white/30 text-sm px-6 py-8 text-center">Sin cotizaciones</p>
            ) : (
              recentQuotes.map((q: any) => (
                <div key={q.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-600">{q.customer_name}</p>
                    <p className="text-white/40 text-xs">{q.customer_phone}</p>
                  </div>
                  <span className={`text-xs font-heading font-700 uppercase px-2 py-1 ${
                    q.status === "pending" ? "bg-orange-400/20 text-orange-400" :
                    q.status === "closed" ? "bg-white/10 text-white/40" :
                    "bg-flase-blue/20 text-flase-blue"
                  }`}>
                    {STATUS_LABELS[q.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-[#1B1B2F] border border-white/5">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="font-heading font-700 text-white text-sm uppercase tracking-wider">
              Próximas Citas
            </h2>
            <Link href="/admin/citas" className="text-flase-red text-xs font-heading uppercase tracking-wider hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingAppointments.length === 0 ? (
              <p className="text-white/30 text-sm px-6 py-8 text-center">Sin citas</p>
            ) : (
              upcomingAppointments.map((a: any) => (
                <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-600">{a.customer_name}</p>
                    <p className="text-white/40 text-xs">
                      {a.preferred_date} · {STATUS_LABELS[a.appointment_type]}
                    </p>
                  </div>
                  <span className={`text-xs font-heading font-700 uppercase px-2 py-1 ${
                    a.status === "pending" ? "bg-orange-400/20 text-orange-400" :
                    a.status === "confirmed" ? "bg-flase-green/20 text-flase-green" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/vehiculos", label: "Ver Vehículos", icon: "🚗" },
          { href: "/admin/cotizaciones?status=pending", label: "Ver Pendientes", icon: "📋" },
          { href: "/admin/citas?status=pending", label: "Ver Citas", icon: "📅" },
          { href: "/", label: "Ver Sitio Web", icon: "🌐", external: true },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            className="bg-white/5 hover:bg-white/10 border border-white/5 p-4 text-center transition-colors duration-200"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-white/60 text-xs font-heading uppercase tracking-wider">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
