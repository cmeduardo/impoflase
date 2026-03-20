import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { getCompanyInfo } from "@/lib/company";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompanyInfo();

  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20">{children}</main>
      <Footer company={company} />
      <WhatsAppButton phone={company?.whatsapp_number} />
    </>
  );
}
