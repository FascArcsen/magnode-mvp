import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/audit`, {
    method: "POST",
  });
  const data = await res.json();
  return NextResponse.json({ job: "mapping-run", result: data });
}