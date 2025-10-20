import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🧭 GET /api/dashboards/[id]/reports/[reportId]
 * Devuelve un reporte individual.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; reportId: string }> }
) {
  try {
    const { reportId } = await context.params; // 👈 importante en Next 15

    const report = await prisma.report.findUnique({
      where: { report_id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("❌ Error fetching report:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching report" },
      { status: 500 }
    );
  }
}

/**
 * 🛠️ PUT /api/dashboards/[id]/reports/[reportId]
 * Actualiza un reporte existente.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; reportId: string }> }
) {
  try {
    const { reportId } = await context.params; // 👈 await obligatorio
    const body = await req.json();

    const report = await prisma.report.update({
      where: { report_id: reportId },
      data: {
        name: body.name,
        type: body.type,
        data_source: body.data_source,
        query_config: body.query_config,
        visualization: body.visualization,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("❌ Error updating report:", error);
    return NextResponse.json(
      { success: false, message: "Error updating report" },
      { status: 500 }
    );
  }
}

/**
 * 🗑️ DELETE /api/dashboards/[id]/reports/[reportId]
 * Elimina un reporte específico.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; reportId: string }> }
) {
  try {
    const { reportId } = await context.params;

    await prisma.report.delete({
      where: { report_id: reportId },
    });

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting report:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting report" },
      { status: 500 }
    );
  }
}
