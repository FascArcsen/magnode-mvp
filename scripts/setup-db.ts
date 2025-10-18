import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setup() {
  console.log("🧹 Resetting local SQLite database...");
  execSync("npx prisma migrate reset --force", { stdio: "inherit" });

  console.log("\n🚀 Applying latest migrations...");
  execSync("npx prisma migrate dev --name init --skip-seed", { stdio: "inherit" });

  console.log("\n⚙️ Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("\n🌱 Seeding test data...");

  // 🟢 Inserta registros de prueba completos según tu modelo real
  await prisma.raw_platform_data.createMany({
    data: [
      {
        connection_id: "conn-001",
        record_type: "test",
        mapped_to_audit_log: false,
        raw_payload: JSON.stringify({
          source: "google",
          event: "login",
          timestamp: new Date().toISOString(),
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        connection_id: "conn-002",
        record_type: "test",
        mapped_to_audit_log: false,
        raw_payload: JSON.stringify({
          source: "slack",
          event: "message_sent",
          timestamp: new Date().toISOString(),
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  });

  console.log("✅ 2 registros de prueba insertados en raw_platform_data");

  console.log("\n🔁 Running initial audit mapping job...");
  try {
    const res = await fetch("http://localhost:3000/api/jobs/map-raw");
    const result = await res.json();
    console.log("📊 Job result:", result);
  } catch {
    console.log("⚠️ No se pudo ejecutar el job (verifica que el servidor esté corriendo)");
  }

  console.log("\n✅ Setup complete. Open Prisma Studio with:");
  console.log("   npx prisma studio");
}

setup()
  .then(() => {
    console.log("\n🎉 Database setup finished successfully!");
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error("❌ Setup failed:", err);
    prisma.$disconnect();
  });