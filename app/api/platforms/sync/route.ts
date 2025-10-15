import { NextRequest, NextResponse } from 'next/server';
import { ConnectorManager } from '@/lib/connectors/connector-manager';
import { prisma } from '@/lib/prisma';
import type { PlatformConnection, PlatformType } from '@/types/connectors';

// Inicializa el manager
const connectorManager = new ConnectorManager(process.env.ANTHROPIC_API_KEY || '');

// ==========================================
// POST /api/platforms/sync - Ejecuta sincronización
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connection_id, incremental } = body;

    // Validación básica
    if (!connection_id) {
      return NextResponse.json(
        { success: false, error: 'Connection ID required' },
        { status: 400 }
      );
    }

    // Busca la conexión en Supabase (a través de Prisma)
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Define la fecha de inicio para sincronización incremental
    const since =
      incremental && connection.last_sync_at
        ? new Date(connection.last_sync_at)
        : undefined;

    // Parseos de campos JSON (para evitar errores de tipo)
    const parsedAuth = connection.auth_config
      ? (connection.auth_config as any)
      : {};

    const parsedConnectorConfig = connection.connector_config
      ? (connection.connector_config as any)
      : {};

    // ==========================================
    // Ejecuta la sincronización con el Manager
    // ==========================================
    const syncResult = await connectorManager.syncConnection(
      connection_id,
      {
        ...(connection as unknown as PlatformConnection),
        auth_config: parsedAuth,
        connector_config: parsedConnectorConfig,
        platform_type: connection.platform_type as PlatformType,
      },
      since
    );

    // Estructura JSON-safe para Prisma
    const safeStats = JSON.parse(JSON.stringify(syncResult.stats ?? {}));
    const safeErrors = JSON.parse(JSON.stringify(syncResult.errors ?? {}));

    // ==========================================
    // Guarda el resultado de la sincronización
    // ==========================================
    const savedSync = await prisma.sync_results.create({
      data: {
        connection_id,
        duration_ms: syncResult.duration_ms ?? 0,
        status: syncResult.status ?? 'completed',
        stats: safeStats,
        errors: safeErrors,
      },
    });

    // ==========================================
    // Respuesta final
    // ==========================================
    return NextResponse.json(
      { success: true, data: savedSync },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ [POST /sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}