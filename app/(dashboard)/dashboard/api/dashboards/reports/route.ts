import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { updated_at: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const body = await req.json();
  const report = await prisma.report.create({
    data: {
      org_id: body.org_id || "org-default",
      dashboard_id: body.dashboard_id,
      name: body.name,
      type: body.type,
      data_source: body.data_source,
      query_config: body.query_config || {},
      visualization: body.visualization || {},
      created_by: "system",
    },
  });
  return NextResponse.json(report);
}