import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      vehicle_id,
      appointment_type,
      preferred_date,
      preferred_time,
    } = body;

    if (!customer_name || !customer_email || !customer_phone || !preferred_date || !preferred_time) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 });
    }

    // Validate date is in future
    const today = new Date().toISOString().split("T")[0];
    if (preferred_date < today) {
      return NextResponse.json({ error: "La fecha debe ser futura" }, { status: 400 });
    }

    const supabase = await createServiceClient();
    const { data, error } = await supabase.from("appointments").insert({
      customer_name,
      customer_email,
      customer_phone,
      vehicle_id: vehicle_id || null,
      appointment_type: appointment_type || "consultation",
      preferred_date,
      preferred_time,
      status: "pending",
    }).select().single();

    if (error) {
      console.error("Error creating appointment:", error);
      return NextResponse.json({ error: "Error al crear cita" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
