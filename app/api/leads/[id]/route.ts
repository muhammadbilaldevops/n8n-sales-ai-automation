import { NextResponse } from "next/server";
import db from "@/lib/db";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const leadId = Number((await params).id); if (!Number.isInteger(leadId) || leadId <= 0) return NextResponse.json({ success: false, message: "Invalid lead ID." }, { status: 400 });
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId); return lead ? NextResponse.json({ success: true, lead }) : NextResponse.json({ success: false, message: "Lead not found." }, { status: 404 });
}
