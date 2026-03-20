import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page handles its own display
  return (
    <div className="min-h-screen bg-[#0E0E1C] admin-scroll">
      {user ? (
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar user={user} />
          <main className="flex-1 overflow-y-auto bg-[#0E0E1C]">
            {children}
          </main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
