import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapRawToAudit } from "@/lib/mappers";
import { Prisma } from "@prisma/client";

export async function POST() {
  try {
    // 1️⃣ Obtener datos crudos desde raw_platform_data
    const rawData = await prisma.raw_platform_data.findMany();

    // 2️⃣ Transformar según el modelo actual
    const mapped: Prisma.audit_logsCreateManyInput[] = rawData.map((r: any) => {
  const normalized = mapRawToAudit(r);

  return {
    log_id: crypto.randomUUID(),
    org_id: (r as any).org_id ?? "org-default",
    connection_id: (r as any).connection_id ?? "conn-default",
    event_type: normalized.action || "Unknown",
    event_source: normalized.platform || "Unknown",
    user_id: normalized.user || "system",
    metadata: JSON.stringify(normalized.metadata || {}),
    raw_event_data: JSON.stringify((r as any).raw_event_data || r || {}),
    timestamp: normalized.timestamp || new Date(),
    created_at: new Date(),
  };
});

    // 3️⃣ Insertar en base de datos
    await prisma.audit_logs.createMany({
      data: mapped,
    });

    return NextResponse.json({ success: true, count: mapped.length });
  } catch (error) {
    console.error("❌ Error in /api/audit:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}