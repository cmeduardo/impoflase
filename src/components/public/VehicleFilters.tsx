"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

const BODY_TYPES = ["SUV", "Sedán", "Pickup", "Hatchback", "Van", "Camioneta", "Coupé"];
const FUEL_TYPES = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"];
const TRANSMISSIONS = ["Automática", "Manual", "CVT"];
const STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "in_transit", label: "Próximo Ingreso" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
];
const YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i);

interface FilterOption {
  label: string;
  options: string[];
  param: string;
}

export default function VehicleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/vehiculos?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAll = () => {
    startTransition(() => {
      router.push("/vehiculos");
    });
  };

  const hasFilters = searchParams.toString() !== "";

  return (
    <aside className="bg-white border border-flase-gray-light p-6 sticky top-24 h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-700 text-flase-navy uppercase text-sm tracking-widest">
          Filtros
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-flase-red text-xs font-heading font-600 uppercase tracking-wider hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {isPending && (
        <div className="w-full h-1 bg-flase-gray-light mb-4 overflow-hidden">
          <div className="h-1 bg-flase-red animate-pulse w-full" />
        </div>
      )}

      {/* Status */}
      <FilterSection title="Estado">
        {STATUSES.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value={value}
              checked={searchParams.get("status") === value}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="accent-flase-red"
            />
            <span className="text-sm text-flase-navy group-hover:text-flase-red transition-colors">
              {label}
            </span>
          </label>
        ))}
        {searchParams.get("status") && (
          <button
            onClick={() => updateFilter("status", "")}
            className="text-xs text-flase-gray hover:text-flase-red"
          >
            Todos los estados
          </button>
        )}
      </FilterSection>

      {/* Body type */}
      <FilterSection title="Carrocería">
        <select
          value={searchParams.get("body_type") || ""}
          onChange={(e) => updateFilter("body_type", e.target.value)}
          className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
        >
          <option value="">Todos</option>
          {BODY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FilterSection>

      {/* Fuel */}
      <FilterSection title="Combustible">
        <select
          value={searchParams.get("fuel_type") || ""}
          onChange={(e) => updateFilter("fuel_type", e.target.value)}
          className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
        >
          <option value="">Todos</option>
          {FUEL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmisión">
        <select
          value={searchParams.get("transmission") || ""}
          onChange={(e) => updateFilter("transmission", e.target.value)}
          className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
        >
          <option value="">Todas</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FilterSection>

      {/* Year */}
      <FilterSection title="Año">
        <select
          value={searchParams.get("year") || ""}
          onChange={(e) => updateFilter("year", e.target.value)}
          className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
        >
          <option value="">Todos</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </FilterSection>

      {/* Price range GTQ */}
      <FilterSection title="Precio Máximo (GTQ)">
        <select
          value={searchParams.get("max_price") || ""}
          onChange={(e) => updateFilter("max_price", e.target.value)}
          className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
        >
          <option value="">Sin límite</option>
          <option value="40000">Q40,000</option>
          <option value="60000">Q60,000</option>
          <option value="80000">Q80,000</option>
          <option value="100000">Q100,000</option>
          <option value="150000">Q150,000</option>
        </select>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-flase-gray-light last:border-0 last:mb-0 last:pb-0">
      <h3 className="font-heading font-700 text-flase-navy text-xs uppercase tracking-widest mb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
