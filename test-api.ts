// ==========================================
// TEST API - Prueba completa del sistema de sincronización
// ==========================================


const API_BASE = 'http://localhost:3000/api/platforms';

interface PlatformConnection {
  connection_id: string;
  org_id: string;
  platform_type: string;
  platform_name: string;
  status: string;
  last_sync_at?: string;
  next_sync_at?: string;
  total_records_synced: number;
  total_audit_logs_created: number;
  sync_frequency_minutes: number;
  auth_config: any;
  connector_config: any;
  created_at: string;
  updated_at: string;
}

interface SyncResult {
  success: boolean;
  data?: any;
  error?: string;
}

// ==========================================
// Test completo
// ==========================================
async function runCompleteTest() {
  console.log('🚀 Iniciando test completo de API de Plataformas\n');
  
  let connectionId: string | undefined;

  try {
    // ==========================================v
    // Paso 1: Crear conexión de prueba
    // ==========================================
    console.log('📦 Paso 1: Creando conexión de prueba...');
    
    const testConnection = {
      org_id: 'org-test-001',
      platform_type: 'universal',
      platform_name: `Test API ${Date.now()}`, 
      auth_config: {
        type: 'api_key',
        credentials: {
          api_key: 'test-key-123'
        }
      },
      connector_config: {
        base_url: 'https://jsonplaceholder.typicode.com',
        endpoints: [
          {
            endpoint_id: 'ep-1',
            name: 'Posts',
            path: '/posts',
            method: 'GET',
            response_data_path: '$',
            query_params: {}
          }
        ],
        data_mapping: {
          required_fields: {
            id: { source_path: '$.id', required: true },
            timestamp: { source_path: '$.id', required: true, default_value: new Date().toISOString() },
            actor: { source_path: '$.userId', required: true },
            action: { source_path: '$.title', required: true }
          }
        }
      },
      sync_frequency_minutes: 60
    };

    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConnection)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create connection: ${JSON.stringify(errorData)}`);
    }

    const createData = await createResponse.json();
    const createdConnection: PlatformConnection = createData.data;
    connectionId = createdConnection.connection_id;

    console.log(`✅ Conexión creada: ${connectionId}\n`);

    // ==========================================
// Paso 1.5: Guardado y validación de tokens (Slack y Google)
// ==========================================
console.log('🔐 Paso 1.5: Probando guardado de tokens (Slack y Google)...');

const providers = ['slack', 'google'];

for (const provider of providers) {
  console.log(`➡️ Guardando tokens de prueba para ${provider.toUpperCase()}...`);

  const fakeTokens = {
    access_token: `${provider}-access-token-123`,
    refresh_token: `${provider}-refresh-token-456`,
    expires_in: 3600,
  };

  const tokenSaveResponse = await fetch(`${API_BASE}/oauth/save-tokens`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    org_id: testConnection.org_id,
    provider,
    tokens: fakeTokens,
  }),
});

  if (!tokenSaveResponse.ok) {
    const errorText = await tokenSaveResponse.text();
    throw new Error(`Error al guardar tokens para ${provider}: ${errorText}`);
  }

  const tokenResult = await tokenSaveResponse.json();
  console.log(`✅ ${tokenResult.message}`);
}

// Espera breve para garantizar escritura en BD
await new Promise(resolve => setTimeout(resolve, 1500));
console.log('\n✅ Tokens de prueba guardados exitosamente en la base de datos.\n');

    // ==========================================
    // Paso 2: Activar conexión automáticamente
    // ==========================================
    console.log('🔄 Paso 2: Activando conexión...');

    const activateResponse = await fetch(`${API_BASE}/${connectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' })
    });

    if (!activateResponse.ok) {
      const errorData = await activateResponse.json();
      console.log('⚠️ No se pudo activar automáticamente:', errorData.error);
      console.log('💡 Activa manualmente con:');
      console.log(`   UPDATE platform_connections SET status = 'active' WHERE connection_id = '${connectionId}';\n`);
      return;
    }

    console.log('✅ Conexión activada exitosamente');
    
    // Esperar un momento para asegurar que la DB se actualice
    console.log('⏳ Esperando 2 segundos para que la activación se complete...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ==========================================
    // Paso 3: Sincronizar conexión
    // ==========================================
    console.log('🔄 Paso 3: Sincronizando conexión...');

    const syncResponse = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        connection_id: connectionId,
        incremental: false 
      })
    });

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      throw new Error(`Sync failed: ${errorText}`);
    }

    const syncData = await syncResponse.json();
    
    console.log('✅ Sincronización completada\n');
    console.log('📊 Resultado de sincronización:');
    console.log(JSON.stringify(syncData.data, null, 2));

    // ==========================================
    // Paso 4: Verificar resultados
    // ==========================================
    console.log('\n🔍 Paso 4: Verificando resultados...');

    const verifyResponse = await fetch(`${API_BASE}/${connectionId}`);
    const verifyData = await verifyResponse.json();
    const updatedConnection: PlatformConnection = verifyData.data;

    console.log('\n📋 Estado de la conexión:');
    console.log(`   - Status: ${updatedConnection.status}`);
    console.log(`   - Last sync: ${updatedConnection.last_sync_at || 'Never'}`);
    console.log(`   - Records synced: ${updatedConnection.total_records_synced}`);
    console.log(`   - Audit logs created: ${updatedConnection.total_audit_logs_created}`);

    // ==========================================
    // Paso 5: Test de endpoint GET
    // ==========================================
    console.log('\n🔍 Paso 5: Probando endpoint GET...');

    const getResponse = await fetch(`${API_BASE}?org_id=${testConnection.org_id}`);
    const getData = await getResponse.json();

    console.log(`✅ Encontradas ${getData.data?.length || 0} conexiones para la organización`);

    // ==========================================
    // Resumen
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log(`\n📊 Resumen:`);
    console.log(`   - Conexión ID: ${connectionId}`);
    console.log(`   - Status final: ${updatedConnection.status}`);
    console.log(`   - Registros sincronizados: ${updatedConnection.total_records_synced}`);
    console.log(`   - Logs de auditoría creados: ${updatedConnection.total_audit_logs_created}`);

  } catch (error: any) {
    console.error('\n❌ Error durante el test:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 Asegúrate de que:');
      console.log('   1. El servidor esté corriendo (npm run dev)');
      console.log('   2. El puerto 3000 esté disponible');
      console.log('   3. El archivo .env esté configurado correctamente');
    }
  } finally {
    // ==========================================
    // Limpieza (opcional)
    // ==========================================
    if (connectionId) {
      console.log('\n🧹 Limpieza:');
      console.log(`   Para eliminar la conexión de prueba, ejecuta:`);
      console.log(`   DELETE FROM platform_connections WHERE connection_id = '${connectionId}';`);
      console.log(`   DELETE FROM sync_results WHERE connection_id = '${connectionId}';`);
    }
  }
}

// ==========================================
// Test básico - Solo verificar conexión
// ==========================================
async function testBasicConnection() {
  console.log('🔍 Test básico: Verificando conexión al servidor...\n');
  
  try {
    const response = await fetch(`${API_BASE}?org_id=org-test-001`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error en la respuesta:', errorData.error);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ Servidor respondiendo correctamente');
    console.log(`📊 Conexiones encontradas: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Conexiones existentes:');
      data.data.forEach((conn: PlatformConnection) => {
        console.log(`   - ${conn.connection_id}: ${conn.platform_name} (${conn.status})`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ No se pudo conectar al servidor:', error.message);
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. El servidor esté corriendo (npm run dev)');
    console.log('   2. El archivo .env esté configurado');
    console.log('   3. La base de datos esté accesible');
  }
}

// ==========================================
// Ejecutar tests
// ==========================================
const args = process.argv.slice(2);

if (args.includes('--simple') || args.includes('-s')) {
  testBasicConnection();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log('📖 Uso:');
  console.log('   npx tsx test-api.ts           # Test completo');
  console.log('   npx tsx test-api.ts --simple  # Test básico de conexión');
  console.log('   npx tsx test-api.ts --help    # Mostrar esta ayuda');
} else {
  runCompleteTest();
}