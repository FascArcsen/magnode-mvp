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

    // Busca la conexión en la base de datos
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Valida que la conexión esté activa
    if (connection.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Connection is ${connection.status}. Only active connections can be synced.` 
        },
        { status: 400 }
      );
    }

    // Define fecha de inicio para sincronización incremental
    const since = incremental && connection.last_sync_at
      ? new Date(connection.last_sync_at)
      : undefined;

    // Parsea campos JSON de forma segura
    let parsedAuth;
    let parsedConnectorConfig;
    
    try {
      parsedAuth = typeof connection.auth_config === 'string' 
        ? JSON.parse(connection.auth_config)
        : (connection.auth_config || {});
      
      parsedConnectorConfig = typeof connection.connector_config === 'string'
        ? JSON.parse(connection.connector_config)
        : (connection.connector_config || {});
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid connection configuration' },
        { status: 400 }
      );
    }

    // Construye el objeto de conexión para el manager
    const connectionForSync: PlatformConnection = {
      connection_id: connection.connection_id,
      org_id: connection.org_id,
      platform_type: connection.platform_type as PlatformType,
      platform_name: connection.platform_name,
      auth_config: parsedAuth,
      connector_config: parsedConnectorConfig,
      status: connection.status as any,
      last_sync_at: connection.last_sync_at?.toISOString(),
      next_sync_at: connection.next_sync_at?.toISOString(),
      sync_frequency_minutes: connection.sync_frequency_minutes || 60,
      total_records_synced: connection.total_records_synced || 0,
      total_audit_logs_created: connection.total_audit_logs_created || 0,
      error_message: connection.error_message || undefined,
      created_at: connection.created_at?.toISOString() || new Date().toISOString(),
      updated_at: connection.updated_at?.toISOString() || new Date().toISOString()
    };

    // ==========================================
    // Ejecuta la sincronización
    // ==========================================
    const syncResult = await connectorManager.syncConnection(
      connection_id,
      connectionForSync,
      since
    );

    // Convierte a JSON-safe para Prisma
    const safeStats = JSON.parse(JSON.stringify(syncResult.stats || {}));
    const safeErrors = JSON.parse(JSON.stringify(syncResult.errors || []));

    // ==========================================
    // Guarda el resultado
    // ==========================================
    const savedSync = await prisma.sync_results.create({
      data: {
        connection_id,
        duration_ms: syncResult.duration_ms || 0,
        status: syncResult.status || 'completed',
        stats: safeStats,
        errors: safeErrors,
      },
    });

    // ==========================================
    // Actualiza la conexión
    // ==========================================
    await prisma.platform_connections.update({
      where: { connection_id },
      data: {
        last_sync_at: new Date(),
        next_sync_at: syncResult.next_sync_at 
          ? new Date(syncResult.next_sync_at) 
          : undefined,
        total_records_synced: {
          increment: syncResult.stats.total_records_processed
        },
        total_audit_logs_created: {
          increment: syncResult.stats.audit_logs_created
        },
        status: syncResult.status === 'failed' ? 'error' : 'active',
        error_message: syncResult.status === 'failed' 
          ? syncResult.errors?.[0]?.error_message 
          : null
      }
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
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}