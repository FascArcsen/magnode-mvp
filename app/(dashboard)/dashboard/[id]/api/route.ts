import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 🧭 GET /dashboard/[id]/api
 * Devuelve un dashboard individual por su ID, con reportes incluidos.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 importante en Next 15

    const dashboard = await prisma.dashboards.findUnique({
      where: { dashboard_id: id },
      include: {
        reports: true,
      },
    });

    if (!dashboard) {
      return NextResponse.json(
        { success: false, message: "Dashboard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error: any) {
    console.error("❌ Error fetching dashboard:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error fetching dashboard" },
      { status: 500 }
    );
  }
}

/**
 * ⚙️ DELETE /dashboard/[id]/api
 * Elimina un dashboard por ID
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 igual aquí

    await prisma.dashboards.delete({
      where: { dashboard_id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting dashboard:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error deleting dashboard" },
      { status: 500 }
    );
  }
}
