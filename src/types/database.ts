export type VehicleStatus = "available" | "in_transit" | "reserved" | "sold";
export type QuoteStatus = "pending" | "contacted" | "quoted" | "closed";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";
export type AppointmentType = "test_drive" | "inspection" | "consultation";
export type UserRole = "admin" | "editor";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_usd: number;
  price_gtq: number | null;
  origin_country: string;
  status: VehicleStatus;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine_cc: number | null;
  mileage_km: number;
  color: string;
  drive_type: string | null;
  features: string[];
  description: string | null;
  estimated_arrival: string | null;
  slug: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  vehicle_images?: VehicleImage[];
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Quote {
  id: string;
  vehicle_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nit: string | null;
  message: string | null;
  status: QuoteStatus;
  admin_notes: string | null;
  created_at: string;
  vehicles?: Pick<Vehicle, "brand" | "model" | "year" | "slug">;
}

export interface Appointment {
  id: string;
  vehicle_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_date: string;
  preferred_time: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  admin_notes: string | null;
  created_at: string;
  vehicles?: Pick<Vehicle, "brand" | "model" | "year" | "slug">;
}

export interface CompanyInfo {
  id: number;
  company_name: string;
  phone_numbers: string[];
  whatsapp_number: string;
  email: string;
  address: string;
  google_maps_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  about_text: string | null;
  business_hours: Record<string, string>;
}

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
