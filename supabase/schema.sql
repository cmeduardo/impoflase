-- ============================================================
-- Importadora FLASE — Schema SQL para Supabase
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE vehicle_status AS ENUM ('available', 'in_transit', 'reserved', 'sold');
CREATE TYPE quote_status AS ENUM ('pending', 'contacted', 'quoted', 'closed');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE appointment_type AS ENUM ('test_drive', 'inspection', 'consultation');
CREATE TYPE user_role AS ENUM ('admin', 'editor');

-- ============================================================
-- PROFILES (linked to Supabase Auth)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1980 AND year <= 2030),
  price_usd NUMERIC(12,2) NOT NULL CHECK (price_usd >= 0),
  price_gtq NUMERIC(12,2) CHECK (price_gtq >= 0),
  origin_country TEXT NOT NULL,
  status vehicle_status NOT NULL DEFAULT 'available',
  body_type TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  engine_cc INTEGER CHECK (engine_cc > 0),
  mileage_km INTEGER NOT NULL DEFAULT 0 CHECK (mileage_km >= 0),
  color TEXT NOT NULL,
  drive_type TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  description TEXT,
  estimated_arrival DATE,
  slug TEXT UNIQUE NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_slug ON vehicles(slug);
CREATE INDEX idx_vehicles_is_featured ON vehicles(is_featured);
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VEHICLE IMAGES
-- ============================================================
CREATE TABLE vehicle_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_is_primary ON vehicle_images(is_primary);

-- ============================================================
-- QUOTES (COTIZACIONES)
-- ============================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_nit TEXT,
  message TEXT,
  status quote_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================================
-- APPOINTMENTS (CITAS)
-- ============================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  appointment_type appointment_type NOT NULL DEFAULT 'consultation',
  status appointment_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_preferred_date ON appointments(preferred_date);

-- ============================================================
-- COMPANY INFO (singleton)
-- ============================================================
CREATE TABLE company_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'Importadora FLASE',
  phone_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_number TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  about_text TEXT,
  business_hours JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Vehicles: public read, authenticated write
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles are publicly readable" ON vehicles
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can insert vehicles" ON vehicles
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update vehicles" ON vehicles
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete vehicles" ON vehicles
  FOR DELETE TO authenticated USING (true);

-- Vehicle images: public read, authenticated write
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicle images are publicly readable" ON vehicle_images
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can manage vehicle images" ON vehicle_images
  FOR ALL TO authenticated USING (true);

-- Quotes: anon can insert, authenticated can read/update
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a quote" ON quotes
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read quotes" ON quotes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update quotes" ON quotes
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete quotes" ON quotes
  FOR DELETE TO authenticated USING (true);

-- Appointments: anon can insert, authenticated can read/update
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create an appointment" ON appointments
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can read appointments" ON appointments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update appointments" ON appointments
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete appointments" ON appointments
  FOR DELETE TO authenticated USING (true);

-- Company info: public read, authenticated write
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company info is publicly readable" ON company_info
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can manage company info" ON company_info
  FOR ALL TO authenticated USING (true);

-- ============================================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- DEFAULT COMPANY INFO
-- ============================================================
INSERT INTO company_info (
  id, company_name, phone_numbers, whatsapp_number, email, address,
  business_hours
) VALUES (
  1,
  'Importadora FLASE',
  '["5000-0000"]'::jsonb,
  '50250000000',
  'info@importadoraflase.com',
  'Guatemala, Guatemala',
  '{"Lunes – Viernes": "8:00 – 18:00", "Sábado": "8:00 – 14:00", "Domingo": "Cerrado"}'::jsonb
) ON CONFLICT (id) DO NOTHING;
