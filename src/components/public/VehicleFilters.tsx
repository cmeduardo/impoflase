"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

const STATUSES = [
  { value: "available", label: "Disponible" },
  { value: "in_transit", label: "Próximo Ingreso" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
];

interface FilterOptions {
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  years: number[];
}

export default function VehicleFilters({ filterOptions }: { filterOptions: FilterOptions }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [priceInput, setPriceInput] = useState(searchParams.get("max_price") || "");

  // Keep price input in sync if user navigates back/forward
  useEffect(() => {
    setPriceInput(searchParams.get("max_price") || "");
  }, [searchParams]);

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

  const applyPrice = () => {
    const trimmed = priceInput.trim();
    updateFilter("max_price", trimmed);
  };

  const clearAll = () => {
    setPriceInput("");
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
      {filterOptions.bodyTypes.length > 0 && (
        <FilterSection title="Carrocería">
          <select
            value={searchParams.get("body_type") || ""}
            onChange={(e) => updateFilter("body_type", e.target.value)}
            className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
          >
            <option value="">Todos</option>
            {filterOptions.bodyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Fuel */}
      {filterOptions.fuelTypes.length > 0 && (
        <FilterSection title="Combustible">
          <select
            value={searchParams.get("fuel_type") || ""}
            onChange={(e) => updateFilter("fuel_type", e.target.value)}
            className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
          >
            <option value="">Todos</option>
            {filterOptions.fuelTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Transmission */}
      {filterOptions.transmissions.length > 0 && (
        <FilterSection title="Transmisión">
          <select
            value={searchParams.get("transmission") || ""}
            onChange={(e) => updateFilter("transmission", e.target.value)}
            className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
          >
            <option value="">Todas</option>
            {filterOptions.transmissions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Year */}
      {filterOptions.years.length > 0 && (
        <FilterSection title="Año">
          <select
            value={searchParams.get("year") || ""}
            onChange={(e) => updateFilter("year", e.target.value)}
            className="w-full border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy"
          >
            <option value="">Todos</option>
            {filterOptions.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Price max — free input */}
      <FilterSection title="Precio Máximo (GTQ)">
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            step={1000}
            placeholder="Ej: 150000"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="w-full border border-flase-gray-light text-sm px-2 py-2 text-flase-navy focus:outline-none focus:border-flase-navy placeholder:text-flase-gray/50"
          />
          <button
            onClick={applyPrice}
            className="bg-flase-navy text-white text-xs font-heading font-700 uppercase px-3 hover:bg-flase-navy/80 transition-colors flex-shrink-0"
          >
            OK
          </button>
        </div>
        {searchParams.get("max_price") && (
          <p className="text-xs text-flase-gray mt-1">
            Hasta Q{Number(searchParams.get("max_price")).toLocaleString("es-GT")}
          </p>
        )}
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
