import { VehicleStatus } from "@/types/database";

export function formatPrice(amount: number, currency: "GTQ" | "USD" = "GTQ"): string {
  if (currency === "GTQ") {
    return `Q${amount.toLocaleString("es-GT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

export function generateSlug(brand: string, model: string, year: number): string {
  const base = `${brand}-${model}-${year}`;
  return base
    .toLowerCase()
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    available: "Disponible",
    in_transit: "Próximo Ingreso",
    reserved: "Reservado",
    sold: "Vendido",
  };
  return labels[status];
}

export function getStatusColor(status: VehicleStatus): string {
  const colors: Record<VehicleStatus, string> = {
    available: "bg-flase-green text-white",
    in_transit: "bg-flase-blue text-white",
    reserved: "bg-yellow-500 text-white",
    sold: "bg-flase-red text-white",
  };
  return colors[status];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
