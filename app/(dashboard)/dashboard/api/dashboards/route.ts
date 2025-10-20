import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🧭 Obtener todos los dashboards existentes
export async function GET() {
  try {
    const dashboards = await prisma.dashboards.findMany({
      orderBy: { updated_at: "desc" },
    });
    return NextResponse.json(dashboards);
  } catch (error: any) {
    console.error("❌ Error fetching dashboards:", error);
    return NextResponse.json(
      { success: false, message: "Error loading dashboards" },
      { status: 500 }
    );
  }
}

// 🧱 Crear un nuevo dashboard
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const dashboard = await prisma.dashboards.create({
      data: {
        org_id: body.org_id || "org-default",
        title: body.title || "Nuevo Dashboard",
        description: body.description || "",
        created_by: "system",

        // ✅ Campo obligatorio del schema
        layout_config: {
          layout: "grid",
          widgets: [],
          filters: [],
          theme: "light",
        },
      },
    });

    return NextResponse.json(dashboard);
  } catch (error: any) {
    console.error("❌ Error creating dashboard:", error);
    return NextResponse.json(
      { success: false, message: "Error creating dashboard" },
      { status: 500 }
    );
  }
}