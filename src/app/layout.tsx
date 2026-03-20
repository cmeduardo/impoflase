import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    template: "%s | Importadora FLASE",
    default: "Importadora FLASE — Vehículos de Calidad en Guatemala",
  },
  description:
    "Importadora FLASE, tu mejor opción para vehículos importados en Guatemala. Catálogo de autos disponibles y próximos ingresos.",
  keywords: ["importadora", "vehículos", "Guatemala", "autos", "FLASE", "carros"],
  openGraph: {
    type: "website",
    locale: "es_GT",
    siteName: "Importadora FLASE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1B1B2F",
              color: "#fff",
              borderRadius: "0",
              border: "1px solid #E63946",
              fontFamily: "Inter, sans-serif",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#E63946", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
