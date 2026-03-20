import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Vehicle } from "@/types/database";
import VehicleCard from "@/components/public/VehicleCard";
import { formatPrice, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/cloudinary";

export const revalidate = 60;

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("is_featured", true)
    .neq("status", "sold")
    .order("created_at", { ascending: false })
    .limit(6);
  return (data as Vehicle[]) || [];
}

async function getInTransitVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(*)")
    .eq("status", "in_transit")
    .order("estimated_arrival", { ascending: true })
    .limit(4);
  return (data as Vehicle[]) || [];
}

export default async function HomePage() {
  const [featured, inTransit] = await Promise.all([
    getFeaturedVehicles(),
    getInTransitVehicles(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center bg-flase-navy-deep overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #E63946 0, #E63946 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-flase-navy-deep via-flase-navy-deep/80 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            {/* Red bar */}
            <div className="w-16 h-1 bg-flase-red mb-8" />

            <h1 className="font-heading font-900 text-white uppercase leading-[0.9] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mb-6">
              Vehículos de{" "}
              <span className="text-flase-red">Calidad</span>
              <br />
              al mejor precio
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
              Importamos los mejores vehículos directamente para vos. Calidad garantizada,
              precios justos y el servicio que merecés.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/vehiculos" className="btn-primary text-base px-8 py-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver Catálogo
              </Link>
              <Link href="/cotizar" className="btn-outline text-base px-8 py-4">
                Cotizar Ahora
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-16">
              {[
                { value: "100+", label: "Vehículos Importados" },
                { value: "5★", label: "Calificación Promedio" },
                { value: "5+", label: "Años de Experiencia" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading font-900 text-white text-3xl sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="text-white/50 text-xs uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom red accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-flase-red" />
      </section>

      {/* FEATURED VEHICLES */}
      {featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="red-bar" />
                <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl">
                  Vehículos Destacados
                </h2>
              </div>
              <Link
                href="/vehiculos"
                className="hidden sm:flex items-center gap-2 text-flase-navy font-heading font-700 text-sm uppercase tracking-widest hover:text-flase-red transition-colors duration-200"
              >
                Ver todos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden">
              <Link href="/vehiculos" className="btn-outline">
                Ver todos los vehículos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* IN TRANSIT / PROXIMOS INGRESOS */}
      {inTransit.length > 0 && (
        <section className="py-20 bg-flase-gray-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="red-bar" />
              <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl">
                Próximos Ingresos
              </h2>
              <p className="text-flase-gray mt-3 max-w-xl">
                Estos vehículos están en camino. Reservá el tuyo antes de que lleguen.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {inTransit.map((vehicle) => {
                const primaryImage = vehicle.vehicle_images?.find((img) => img.is_primary);
                const imageUrl = primaryImage
                  ? getImageUrl(primaryImage.cloudinary_public_id, "catalog")
                  : "/placeholder-car.svg";

                return (
                  <Link
                    key={vehicle.id}
                    href={`/vehiculos/${vehicle.slug}`}
                    className="group block bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0 bg-flase-gray-light">
                        <Image
                          src={imageUrl}
                          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 224px"
                        />
                        {/* Red side bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-flase-red" />
                      </div>

                      {/* Info */}
                      <div className="bg-flase-navy flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-heading font-700 uppercase tracking-widest bg-flase-blue text-white px-2.5 py-1">
                              Próximo Ingreso
                            </span>
                          </div>
                          <h3 className="font-heading font-800 text-white uppercase text-xl leading-tight">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          <p className="text-white/50 text-sm mt-1">
                            {vehicle.year} · {vehicle.color} · {vehicle.origin_country}
                          </p>
                          {vehicle.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {vehicle.features.slice(0, 2).map((f) => (
                                <span key={f} className="text-[10px] font-heading font-700 uppercase bg-white/10 text-white/80 px-2 py-0.5">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <div>
                            {vehicle.price_gtq && (
                              <p className="text-flase-red font-heading font-800 text-xl">
                                {formatPrice(vehicle.price_gtq, "GTQ")}
                              </p>
                            )}
                            {vehicle.estimated_arrival && (
                              <p className="text-white/40 text-xs mt-0.5">
                                Llegada est.: {formatDate(vehicle.estimated_arrival)}
                              </p>
                            )}
                          </div>
                          <div className="text-flase-red font-heading font-700 text-sm uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                            Ver
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-flase-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="w-12 h-1 bg-flase-red mx-auto mb-4" />
            <h2 className="font-heading font-800 uppercase text-white text-3xl sm:text-4xl lg:text-5xl">
              ¿Por qué elegir FLASE?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Calidad Garantizada",
                desc: "Todos nuestros vehículos pasan por inspección antes de ser importados.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Precios Justos",
                desc: "Precios competitivos y transparentes, sin costos ocultos.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: "Importación Directa",
                desc: "Importamos directamente desde USA, Japón y Corea para mejores precios.",
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                ),
                title: "Asesoría Personalizada",
                desc: "Te acompañamos en cada paso del proceso de compra.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-white/10 p-6 hover:border-flase-red transition-colors duration-300 group"
              >
                <div className="text-flase-red mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">
                  {item.icon}
                </div>
                <h3 className="font-heading font-700 text-white uppercase text-sm tracking-wider mb-2">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO DE COMPRA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="w-12 h-1 bg-flase-red mx-auto mb-4" />
            <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl">
              ¿Cómo funciona?
            </h2>
            <p className="text-flase-gray mt-3 max-w-lg mx-auto">
              Proceso simple y transparente para obtener tu vehículo importado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Elegí", desc: "Explorá nuestro catálogo y encontrá el vehículo ideal para vos." },
              { step: "02", title: "Cotizá", desc: "Solicitá tu cotización personalizada sin compromiso." },
              { step: "03", title: "Importamos", desc: "Gestionamos toda la importación y documentación por vos." },
              { step: "04", title: "Recibí", desc: "Recibí tu vehículo listo para rodar en Guatemala." },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-0 h-0.5 bg-flase-gray-light" />
                )}

                <div className="relative inline-flex items-center justify-center w-16 h-16 border-2 border-flase-red mb-5 mx-auto">
                  <span className="font-heading font-900 text-flase-red text-xl">{item.step}</span>
                </div>
                <h3 className="font-heading font-800 text-flase-navy uppercase text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-flase-gray text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-flase-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-900 text-white uppercase text-3xl sm:text-4xl lg:text-5xl mb-4">
            ¿Listo para encontrar tu vehículo?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Contactanos hoy y te asesoramos sin compromiso.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/vehiculos"
              className="bg-white text-flase-red hover:bg-flase-navy hover:text-white font-heading font-700 uppercase tracking-wider px-8 py-4 transition-all duration-200"
            >
              Ver Catálogo
            </Link>
            <Link
              href="/cotizar"
              className="border-2 border-white text-white hover:bg-white hover:text-flase-red font-heading font-700 uppercase tracking-wider px-8 py-4 transition-all duration-200"
            >
              Cotizar Ahora
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
