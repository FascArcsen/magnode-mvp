import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ==========================================
// GET /api/platforms/[id] - Obtener conexión específica
// ==========================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id: id }
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: connection });
  } catch (error: any) {
    console.error('[GET /api/platforms/[id]] Error:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Verificar que la conexión existe
    const existing = await prisma.platform_connections.findUnique({
      where: { connection_id: id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Campos permitidos para actualizar
    if (body.status !== undefined) updateData.status = body.status;
    if (body.platform_name !== undefined) updateData.platform_name = body.platform_name;
    if (body.sync_frequency_minutes !== undefined) {
      updateData.sync_frequency_minutes = body.sync_frequency_minutes;
    }
    if (body.auth_config !== undefined) {
      updateData.auth_config = body.auth_config;
    }
    if (body.connector_config !== undefined) {
      updateData.connector_config = body.connector_config;
    }
    if (body.last_sync_at !== undefined) {
      updateData.last_sync_at = body.last_sync_at;
    }
    if (body.next_sync_at !== undefined) {
      updateData.next_sync_at = body.next_sync_at;
    }
    if (body.error_message !== undefined) {
      updateData.error_message = body.error_message;
    }

    // Actualizar en la base de datos
    const updated = await prisma.platform_connections.update({
      where: { connection_id: id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[PATCH /api/platforms/[id]] Error:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verificar que existe
    const existing = await prisma.platform_connections.findUnique({
      where: { connection_id: id }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Eliminar sync_results relacionados primero
    await prisma.sync_results.deleteMany({
      where: { connection_id: id }
    });

    // Eliminar la conexión
    await prisma.platform_connections.delete({
      where: { connection_id: id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Connection deleted successfully' 
    });
  } catch (error: any) {
    console.error('[DELETE /api/platforms/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}