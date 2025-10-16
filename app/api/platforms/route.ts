import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==========================================
// GET /api/platforms - Obtener conexiones
// ==========================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const connectionId = searchParams.get("id");

    // ✅ Si se pide una conexión específica
    if (connectionId) {
      const connection = await prisma.platform_connections.findUnique({
        where: { connection_id: connectionId },
      });

      if (!connection) {
        return NextResponse.json(
          { success: false, error: "Connection not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: connection });
    }

    // ✅ Obtener todas las conexiones (filtradas por organización opcionalmente)
    const connections = await prisma.platform_connections.findMany({
      where: orgId ? { org_id: orgId } : undefined,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: connections });
  } catch (error: any) {
    console.error("❌ [GET /platforms] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// POST /api/platforms - Crear conexión
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      org_id,
      platform_type,
      platform_name,
      auth_config,
      connector_config,
      sync_frequency_minutes,
    } = body;

    // ✅ Validación básica
    if (!org_id || !platform_type || !platform_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Crear conexión
    const connection = await prisma.platform_connections.create({
      data: {
        org_id,
        platform_type,
        platform_name,
        auth_config: auth_config || {},
        connector_config: connector_config || {},
        sync_frequency_minutes: sync_frequency_minutes || 60,
        status: "inactive",
      },
    });

    return NextResponse.json({ success: true, data: connection }, { status: 201 });
  } catch (error: any) {
    console.error("❌ [POST /platforms] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE /api/platforms - Eliminar conexión
// ==========================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("id");

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: "Connection ID required" },
        { status: 400 }
      );
    }

    // ✅ Verificar si existe antes de borrar
    const existing = await prisma.platform_connections.findUnique({
      where: { connection_id: connectionId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Connection not found" },
        { status: 404 }
      );
    }

    await prisma.platform_connections.delete({
      where: { connection_id: connectionId },
    });

    return NextResponse.json({ success: true, message: "Connection deleted" });
  } catch (error: any) {
    console.error("❌ [DELETE /platforms] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}