-- ============================================================
-- Importadora FLASE — Seed Data
-- ============================================================

-- Vehículos de ejemplo
INSERT INTO vehicles (
  brand, model, year, price_usd, price_gtq, origin_country, status,
  body_type, fuel_type, transmission, engine_cc, mileage_km, color,
  drive_type, features, description, estimated_arrival, slug, is_featured
) VALUES
(
  'Toyota', 'RAV4', 2011, 6250.00, 48500.00, 'USA', 'in_transit',
  'SUV', 'Gasolina', 'Automática', 2500, 85000, 'Dorado/Arena',
  '4x4',
  '["Bolsas intactas", "Llantas nuevas", "AC frío"]'::jsonb,
  'Toyota RAV4 2011 en excelentes condiciones, recién importado de USA. Bolsas intactas, llantas nuevas. Motor 2.5L en perfectas condiciones.',
  (CURRENT_DATE + INTERVAL '15 days')::date,
  'toyota-rav4-2011',
  true
),
(
  'Honda', 'CR-V', 2015, 8000.00, 62500.00, 'USA', 'available',
  'SUV', 'Gasolina', 'Automática', 2400, 65000, 'Blanco',
  'AWD',
  '["Cámara trasera", "Bluetooth", "Sunroof", "Bolsas intactas"]'::jsonb,
  'Honda CR-V 2015 AWD en condición impecable. Full equipo, cámara trasera, bluetooth, sunroof. Historial de mantenimiento completo.',
  NULL,
  'honda-cr-v-2015',
  true
),
(
  'Toyota', 'Corolla', 2018, 9100.00, 71000.00, 'Japón', 'available',
  'Sedán', 'Gasolina', 'CVT', 1800, 42000, 'Gris',
  '4x2',
  '["Apple CarPlay", "Android Auto", "Lane Assist", "Bolsas intactas"]'::jsonb,
  'Toyota Corolla 2018 importado directamente de Japón. Muy bajo kilometraje, tecnología de seguridad avanzada, excelente consumo de combustible.',
  NULL,
  'toyota-corolla-2018',
  true
),
(
  'Hyundai', 'Tucson', 2016, 7750.00, 60500.00, 'Corea', 'sold',
  'SUV', 'Gasolina', 'Automática', 2000, 75000, 'Negro',
  '4x2',
  '["Pantalla touch", "Bluetooth", "AC automático"]'::jsonb,
  'Hyundai Tucson 2016 en excelente estado. Equipado con pantalla touch, bluetooth y AC automático.',
  NULL,
  'hyundai-tucson-2016',
  false
),
(
  'Nissan', 'Frontier', 2014, 5100.00, 40000.00, 'USA', 'available',
  'Pickup', 'Diésel', 'Manual', 2500, 110000, 'Blanco',
  '4x4',
  '["Doble cabina", "Caja de carga", "Transmisión manual 6 velocidades"]'::jsonb,
  'Nissan Frontier 2014 4x4 diésel. Perfecta para trabajo y aventura. Motor fuerte y confiable, carrocería en buen estado.',
  NULL,
  'nissan-frontier-2014',
  false
);
