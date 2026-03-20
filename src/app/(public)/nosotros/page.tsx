import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCompanyInfo } from "@/lib/company";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conocé la historia y valores de Importadora FLASE.",
};

export default async function NosotrosPage() {
  const company = await getCompanyInfo();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-flase-navy py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="w-12 h-1 bg-flase-red mb-6" />
            <h1 className="font-heading font-900 text-white uppercase text-4xl sm:text-5xl lg:text-6xl mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Somos Importadora FLASE, tu aliado de confianza para encontrar el vehículo ideal en Guatemala.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-8 h-0.5 bg-flase-red mb-6" />
              <h2 className="section-title text-3xl sm:text-4xl mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-flase-gray leading-relaxed">
                {company?.about_text ? (
                  company.about_text.split("\n").filter(Boolean).map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Importadora FLASE nació con una visión clara: brindar acceso a vehículos de alta calidad importados directamente desde Estados Unidos, Japón y Corea, a precios justos y con total transparencia.
                    </p>
                    <p>
                      Con más de 5 años de experiencia en el mercado guatemalteco, hemos construido una reputación sólida basada en la confianza, la honestidad y el compromiso con nuestros clientes.
                    </p>
                    <p>
                      Cada vehículo en nuestro catálogo pasa por un riguroso proceso de selección e inspección antes de ser importado, garantizando que llegue en las mejores condiciones posibles.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] bg-flase-navy-deep flex items-center justify-center">
                <Image
                  src="/logo-white.png"
                  alt="Importadora FLASE"
                  width={280}
                  height={100}
                  className="opacity-30 w-48"
                />
              </div>
              {/* Decorative corner */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-flase-red opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-flase-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="w-12 h-1 bg-flase-red mx-auto mb-4" />
            <h2 className="section-title text-3xl sm:text-4xl">Nuestros Valores</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: "🤝",
                title: "Confianza",
                desc: "Construimos relaciones a largo plazo basadas en la transparencia y la honestidad en cada operación.",
              },
              {
                icon: "⭐",
                title: "Calidad",
                desc: "Seleccionamos cuidadosamente cada vehículo para garantizar que cumpla con los más altos estándares.",
              },
              {
                icon: "💡",
                title: "Asesoría",
                desc: "Te acompañamos en todo el proceso, desde la selección hasta la entrega de tu vehículo.",
              },
            ].map((value) => (
              <div key={value.title} className="bg-white p-8 text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="font-heading font-700 text-flase-navy uppercase text-lg mb-3">
                  {value.title}
                </h3>
                <p className="text-flase-gray text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-flase-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-800 text-white uppercase text-2xl sm:text-3xl mb-6">
            ¿Listo para encontrar tu vehículo?
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/vehiculos" className="btn-primary">
              Ver Catálogo
            </Link>
            <Link href="/contacto" className="btn-outline">
              Contactanos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
