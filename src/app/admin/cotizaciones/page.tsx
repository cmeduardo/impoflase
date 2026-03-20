import { createClient } from "@/lib/supabase/server";
import { Quote } from "@/types/database";
import QuoteStatusUpdater from "@/components/admin/QuoteStatusUpdater";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cotizaciones — Admin FLASE" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  quoted: "Cotizado",
  closed: "Cerrado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-400/20 text-orange-400",
  contacted: "bg-flase-blue/20 text-flase-blue",
  quoted: "bg-purple-400/20 text-purple-400",
  closed: "bg-white/10 text-white/40",
};

async function getQuotes(status?: string): Promise<Quote[]> {
  const supabase = await createClient();
  let query = supabase
    .from("quotes")
    .select("*, vehicles(brand, model, year)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data as Quote[]) || [];
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const quotes = await getQuotes(params.status);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-800 text-white uppercase text-2xl">Cotizaciones</h1>
          <p className="text-white/40 text-sm mt-0.5">{quotes.length} cotización{quotes.length !== 1 ? "es" : ""}</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "", label: "Todas" },
          { value: "pending", label: "Pendientes" },
          { value: "contacted", label: "Contactados" },
          { value: "quoted", label: "Cotizados" },
          { value: "closed", label: "Cerrados" },
        ].map((opt) => (
          <a
            key={opt.value}
            href={opt.value ? `/admin/cotizaciones?status=${opt.value}` : "/admin/cotizaciones"}
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
        {quotes.length === 0 ? (
          <p className="text-white/30 text-sm px-6 py-16 text-center">No hay cotizaciones.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cliente", "Contacto", "Vehículo", "Fecha", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-heading font-700 uppercase tracking-wider text-white/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4">
                      <p className="text-white text-sm font-600">{quote.customer_name}</p>
                      {quote.customer_nit && (
                        <p className="text-white/30 text-xs">NIT: {quote.customer_nit}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white/70 text-sm">{quote.customer_phone}</p>
                      <p className="text-white/40 text-xs">{quote.customer_email}</p>
                      <a
                        href={`https://wa.me/${quote.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${quote.customer_name}, le contactamos de Importadora FLASE sobre su cotización.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] text-xs font-heading uppercase mt-1 inline-flex items-center gap-1 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      {(quote as any).vehicles ? (
                        <p className="text-white/70 text-sm">
                          {(quote as any).vehicles.brand} {(quote as any).vehicles.model} {(quote as any).vehicles.year}
                        </p>
                      ) : (
                        <p className="text-white/30 text-xs">Sin vehículo</p>
                      )}
                      {quote.message && (
                        <p className="text-white/30 text-xs mt-1 max-w-xs truncate" title={quote.message}>
                          "{quote.message}"
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-white/40 text-xs">
                      {new Date(quote.created_at).toLocaleDateString("es-GT")}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-heading font-700 uppercase px-2 py-1 ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <QuoteStatusUpdater quoteId={quote.id} currentStatus={quote.status} />
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
