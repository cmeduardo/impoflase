import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, customer_nit, vehicle_id, message } = body;

    if (!customer_name || !customer_email || !customer_phone) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { data, error } = await supabase.from("quotes").insert({
      customer_name,
      customer_email,
      customer_phone,
      customer_nit: customer_nit || null,
      vehicle_id: vehicle_id || null,
      message: message || null,
      status: "pending",
    }).select().single();

    if (error) {
      console.error("Error creating quote:", error);
      return NextResponse.json({ error: "Error al crear cotización" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
