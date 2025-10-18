import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenManager } from '@/lib/oauth/token-manager';

/**
 * 🔄 Sincronización de datos de plataformas conectadas
 * 
 * Soporta todos los tipos de conectores:
 * - Pre-built OAuth (Google, Slack, etc.)
 * - Universal Connectors
 * - AI-Assisted Connectors
 */

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const { connection_id, incremental = false } = await req.json();

    if (!connection_id) {
      return NextResponse.json(
        { success: false, error: 'connection_id is required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting sync for connection: ${connection_id}`);
    console.log(`📊 Incremental: ${incremental}`);

    // =========================================
    // 1. OBTENER CONEXIÓN DE LA BD
    // =========================================
    const connection = await prisma.platform_connections.findUnique({
      where: { connection_id },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    // =========================================
    // 2. PARSEAR CONFIGURACIÓN
    // =========================================
    const authConfig = JSON.parse(connection.auth_config as string);
    const connectorConfig = JSON.parse(connection.connector_config as string);

    console.log(`📡 Platform: ${connection.platform_name}`);
    console.log(`🔐 Auth type: ${authConfig.type}`);

    // =========================================
    // 3. PREPARAR AUTENTICACIÓN
    // =========================================
    let authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Desencriptar credenciales según el tipo
    try {
      switch (authConfig.type) {
        case 'oauth2':
          // Para OAuth, obtener tokens de la tabla oauth_tokens
          const tokens = await prisma.oauth_tokens.findFirst({
            where: {
              org_id: connection.org_id,
              provider: authConfig.provider,
            },
          });

          if (!tokens) {
            throw new Error(`OAuth tokens not found for ${authConfig.provider}`);
          }

          const accessToken = TokenManager.decrypt(tokens.access_token);
          authHeaders['Authorization'] = `Bearer ${accessToken}`;
          break;

        case 'bearer':
          const bearerToken = TokenManager.decrypt(
            authConfig.credentials.bearer_token
          );
          authHeaders['Authorization'] = `Bearer ${bearerToken}`;
          break;

        case 'api_key':
          const apiKey = TokenManager.decrypt(authConfig.credentials.api_key);
          // Puede variar según la API: X-API-Key, api_key, etc.
          authHeaders['X-API-Key'] = apiKey;
          authHeaders['Authorization'] = `Bearer ${apiKey}`; // Algunos usan ambos
          break;

        case 'basic':
          const username = authConfig.credentials.username;
          const password = TokenManager.decrypt(authConfig.credentials.password);
          const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
          authHeaders['Authorization'] = `Basic ${basicAuth}`;
          break;

        default:
          console.warn(`⚠️ Unknown auth type: ${authConfig.type}`);
      }
    } catch (decryptError: any) {
      console.error('❌ Failed to decrypt credentials:', decryptError);
      
      await prisma.platform_connections.update({
        where: { connection_id },
        data: {
          status: 'error',
          error_message: 'Invalid or expired credentials',
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to decrypt credentials. Please reconnect the platform.',
        },
        { status: 401 }
      );
    }

    // =========================================
    // 4. SINCRONIZAR CADA ENDPOINT
    // =========================================
    const endpoints = connectorConfig.endpoints || [];
    let totalRecordsSynced = 0;
    const syncErrors: any[] = [];
    const syncedData: any[] = [];

    console.log(`📋 Syncing ${endpoints.length} endpoints...`);

    for (const endpoint of endpoints) {
      try {
        console.log(`  → ${endpoint.method} ${endpoint.path}`);

        const url = `${connectorConfig.base_url}${endpoint.path}`;

        const response = await fetch(url, {
          method: endpoint.method || 'GET',
          headers: authHeaders,
        });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Determinar cuántos registros se obtuvieron
        let recordCount = 0;
        if (Array.isArray(data)) {
          recordCount = data.length;
        } else if (data.data && Array.isArray(data.data)) {
          recordCount = data.data.length;
        } else if (data.items && Array.isArray(data.items)) {
          recordCount = data.items.length;
        } else {
          recordCount = 1; // Single object
        }

        console.log(`    ✅ Fetched ${recordCount} records`);

        // Guardar en raw_platform_data
        await prisma.raw_platform_data.create({
          data: {
            connection_id,
            data_source: endpoint.name || endpoint.path,
            raw_payload: JSON.stringify(data),
            extracted_at: new Date(),
            record_type: endpoint.name || 'unknown',
            mapped_to_audit_log: false,
          },
        });

        totalRecordsSynced += recordCount;
        syncedData.push({
          endpoint: endpoint.name,
          records: recordCount,
          status: 'success',
        });

      } catch (endpointError: any) {
        console.error(`    ❌ Error: ${endpointError.message}`);
        syncErrors.push({
          endpoint: endpoint.name,
          error: endpointError.message,
        });
      }
    }

    // =========================================
    // 5. ACTUALIZAR ESTADO DE LA CONEXIÓN
    // =========================================
    const syncStatus = syncErrors.length > 0 ? 'error' : 'active';
    const errorMessage = syncErrors.length > 0
      ? `Failed to sync ${syncErrors.length} endpoint(s)`
      : null;

    await prisma.platform_connections.update({
      where: { connection_id },
      data: {
        status: syncStatus,
        last_sync_at: new Date(),
        total_records_synced: {
          increment: totalRecordsSynced,
        },
        error_message: errorMessage,
        updated_at: new Date(),
      },
    });

    // =========================================
    // 6. CREAR REGISTRO EN SYNC_RESULTS
    // =========================================
    const duration = Date.now() - startTime;

    await prisma.sync_results.create({
      data: {
        connection_id,
        started_at: new Date(startTime),
        completed_at: new Date(),
        status: syncStatus,
        records_synced: totalRecordsSynced,
        incremental,
        ...(syncErrors.length > 0 && { errors: JSON.stringify(syncErrors) }),
      },
    });

    // =========================================
    // 7. RESPUESTA
    // =========================================
    console.log(`✅ Sync completed in ${duration}ms`);
    console.log(`📊 Total records: ${totalRecordsSynced}`);

    return NextResponse.json({
      success: true,
      data: {
        connection_id,
        platform_name: connection.platform_name,
        status: syncStatus,
        stats: {
          total_records_synced: totalRecordsSynced,
          endpoints_synced: endpoints.length - syncErrors.length,
          endpoints_failed: syncErrors.length,
          duration_ms: duration,
        },
        synced_endpoints: syncedData,
        errors: syncErrors.length > 0 ? syncErrors : undefined,
      },
    });

  } catch (error: any) {
    console.error('❌ Sync error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Sync failed',
      },
      { status: 500 }
    );
  }
}