import { createClient } from "@/lib/supabase/server";
import CompanyInfoForm from "@/components/admin/CompanyInfoForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración — Admin FLASE" };

async function getCompanyInfo() {
  const supabase = await createClient();
  const { data } = await supabase.from("company_info").select("*").eq("id", 1).single();
  return data;
}

export default async function ConfiguracionPage() {
  const companyInfo = await getCompanyInfo();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-800 text-white uppercase text-2xl">Configuración</h1>
        <p className="text-white/40 text-sm mt-0.5">Información de la empresa</p>
      </div>
      <CompanyInfoForm initialData={companyInfo} />
    </div>
  );
}
