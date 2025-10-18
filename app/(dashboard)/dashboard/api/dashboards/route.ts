import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dashboards = await prisma.dashboards.findMany({
    orderBy: { updated_at: "desc" },
  });
  return NextResponse.json(dashboards);
}

export async function POST(req: Request) {
  const body = await req.json();
  const dashboard = await prisma.dashboards.create({
    data: {
      org_id: body.org_id || "org-default",
      title: body.title,
      description: body.description || "",
      created_by: "system",
    },
  });
  return NextResponse.json(dashboard);
}