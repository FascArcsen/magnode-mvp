import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai"; // o Anthropic según el proveedor que uses

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  try {
    console.log("🧠 Iniciando proceso de IA contextual...");

    // 1️⃣ Obtener logs relevantes
    const logs = await prisma.audit_logs.findMany({
      orderBy: { created_at: "desc" },
      take: 100, // limitar para pruebas
    });

    if (!logs.length) {
      return NextResponse.json({
        success: false,
        message: "No hay audit_logs para procesar.",
      });
    }

    // 2️⃣ Preparar datos para IA
    const contextText = logs
      .map(
        (l) =>
          `[${l.event_source}] ${l.event_type} by ${l.user_id}: ${l.metadata}`
      )
      .join("\n");

    // 3️⃣ Crear prompt estructurado
    const prompt = `
Analiza los siguientes eventos empresariales y crea:
- Lista de entidades únicas (personas, equipos, proyectos, temas).
- Relaciones entre esas entidades (colaboración, dependencia, conversación).
- Configuración de páginas relevantes (team_view, project_dashboard).

Devuélvelo en formato JSON con esta estructura:
{
  "entities": [{ "name": "", "type": "", "description": "", "source": "", "relevance": 0.9 }],
  "relations": [{ "source": "", "target": "", "relation_type": "", "weight": 0.7 }],
  "pages": [{ "title": "", "type": "", "layout": {}, "parameters": {}, "related_nodes": [] }]
}

Eventos:
${contextText}
`;

    // 4️⃣ Llamar al modelo
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente experto en modelar sistemas organizacionales inteligentes.",
        },
        { role: "user", content: prompt },
      ],
    });

    // ✅ Validar que la respuesta no sea nula
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("La respuesta del modelo está vacía o es inválida.");
    }

    let data;
    try {
      data = JSON.parse(content);
    } catch (err) {
      console.error("⚠️ Error al parsear la respuesta del modelo:", content);
      throw new Error("El modelo devolvió un JSON inválido.");
    }

    // 5️⃣ Guardar en base de datos
    if (data.entities?.length) {
      await prisma.entity_nodes.createMany({
        data: data.entities.map((e: any) => ({
          org_id: "org-default",
          name: e.name,
          type: e.type,
          description: e.description,
          source: e.source,
          relevance: e.relevance ?? 0.5,
          metadata: e.metadata ?? {},
        })),
      });
    }

    if (data.relations?.length) {
      await prisma.relations_map.createMany({
        data: data.relations.map((r: any) => ({
          source_node: r.source,
          target_node: r.target,
          relation_type: r.relation_type,
          weight: r.weight ?? 1,
          context_label: r.context_label ?? null,
        })),
      });
    }

    if (data.pages?.length) {
      await prisma.page_configs.createMany({
        data: data.pages.map((p: any) => ({
          org_id: "org-default",
          title: p.title,
          type: p.type,
          layout: p.layout ?? {},
          parameters: p.parameters ?? {},
          related_nodes: p.related_nodes ?? [],
          generated_by: "AI",
        })),
      });
    }

    console.log("✅ IA Contextual completada correctamente");
    return NextResponse.json({ success: true, summary: data });
  } catch (error: any) {
    console.error("❌ Error en IA Contextual:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
