import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🧭 GET /api/dashboards/[id]/reports
 * Devuelve todos los reportes asociados a un dashboard específico.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Nuevo formato

    const reports = await prisma.report.findMany({
      where: { dashboard_id: id },
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error("❌ Error fetching reports:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching reports" },
      { status: 500 }
    );
  }
}

/**
 * 🧱 POST /api/dashboards/[id]/reports
 * Crea un nuevo reporte vinculado directamente al dashboard [id].
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Nuevo formato
    const body = await req.json();

    // Validación básica
    if (!body.name || !body.type || !body.data_source) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name, type, data_source",
        },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        org_id: body.org_id || "org-default",
        dashboard_id: id, // 🧠 Se usa el ID dinámico del dashboard
        name: body.name,
        type: body.type,
        data_source: body.data_source,
        query_config: body.query_config || {},
        visualization: body.visualization || {},
        created_by: "system",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("❌ Error creating report:", error);
    return NextResponse.json(
      { success: false, message: "Error creating report" },
      { status: 500 }
    );
  }
}