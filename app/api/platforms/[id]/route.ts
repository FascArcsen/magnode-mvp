import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================================
// GET /api/platforms/[id] - Obtener conexión específica
// ==========================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ cambio clave

    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: id },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: connection });
  } catch (error: any) {
    console.error("[GET /api/platforms/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH /api/platforms/[id] - Actualizar conexión
// ==========================================
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.platform_connections.findUnique({
      where: { connection_id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updateData.status = body.status;
    if (body.platform_name !== undefined)
      updateData.platform_name = body.platform_name;
    if (body.sync_frequency_minutes !== undefined)
      updateData.sync_frequency_minutes = body.sync_frequency_minutes;
    if (body.auth_config !== undefined) updateData.auth_config = body.auth_config;
    if (body.connector_config !== undefined)
      updateData.connector_config = body.connector_config;
    if (body.last_sync_at !== undefined)
      updateData.last_sync_at = body.last_sync_at;
    if (body.next_sync_at !== undefined)
      updateData.next_sync_at = body.next_sync_at;
    if (body.error_message !== undefined)
      updateData.error_message = body.error_message;

    const updated = await prisma.platform_connections.update({
      where: { connection_id: id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[PATCH /api/platforms/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE /api/platforms/[id] - Eliminar conexión
// ==========================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const existing = await prisma.platform_connections.findUnique({
      where: { connection_id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    await prisma.sync_results.deleteMany({
      where: { connection_id: id },
    });

    await prisma.platform_connections.delete({
      where: { connection_id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Connection deleted successfully",
    });
  } catch (error: any) {
    console.error("[DELETE /api/platforms/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}