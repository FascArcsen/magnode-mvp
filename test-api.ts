/**
 * ==========================================
 * 🔍 MagNode API Sync Test
 * ==========================================
 * Este script prueba el endpoint:
 *   POST /api/platforms/sync
 * usando Node.js 22+ con fetch nativo.
 */

const API_URL = "http://localhost:3000/api/platforms/sync";

// ⚙️ Cambia este ID por uno que exista en tu tabla Supabase (platform_connections)
const TEST_CONNECTION_ID = "dcc3bdd3-b97e-4844-8c92-e4685661c12b";

async function testSync() {
  console.log(`\n🚀 Iniciando prueba de sincronización para conexión: ${TEST_CONNECTION_ID}\n`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: TEST_CONNECTION_ID,
        incremental: false, // Cambia a true si deseas probar sync incremental
      }),
    });

    const data = await response.json();

    console.log("📦 Respuesta completa del servidor:\n", JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log("\n✅ Test completado con éxito");
    } else {
      console.warn("\n⚠️ Test finalizado con error:", data.error || "Sin mensaje de error");
    }
  } catch (error: any) {
    console.error("\n❌ Error al ejecutar el test:", error.message);
  }
}

testSync();