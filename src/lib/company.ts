import { createClient } from "@/lib/supabase/server";
import { CompanyInfo } from "@/types/database";

export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_info")
    .select("*")
    .eq("id", 1)
    .single();
  return data;
}
