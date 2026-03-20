import LoginForm from "@/components/admin/LoginForm";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Importadora FLASE",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-flase-navy-deep flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #E63946 0, #E63946 1px, transparent 0, transparent 50%)",
            backgroundSize: "25px 25px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Red accent top */}
        <div className="h-1 bg-flase-red" />

        <div className="bg-[#1B1B2F] p-10">
          <div className="text-center mb-10">
            <Image
              src="/logo-white.png"
              alt="Importadora FLASE"
              width={160}
              height={60}
              className="h-12 w-auto mx-auto mb-6"
            />
            <h1 className="font-heading font-700 text-white uppercase text-sm tracking-widest">
              Panel Administrativo
            </h1>
          </div>

          <LoginForm />
        </div>

        <div className="h-0.5 bg-white/10" />
      </div>
    </div>
  );
}
