"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "created_at-desc", label: "Más recientes" },
  { value: "price_gtq-asc", label: "Precio: menor a mayor" },
  { value: "price_gtq-desc", label: "Precio: mayor a menor" },
  { value: "year-desc", label: "Año: más nuevo" },
  { value: "year-asc", label: "Año: más antiguo" },
];

export default function SortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/vehiculos?${params.toString()}`);
  };

  return (
    <select
      defaultValue={current || "created_at-desc"}
      onChange={(e) => handleChange(e.target.value)}
      className="border border-flase-gray-light text-sm p-2 text-flase-navy focus:outline-none focus:border-flase-navy bg-white"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
