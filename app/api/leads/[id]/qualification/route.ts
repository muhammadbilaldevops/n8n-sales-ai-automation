import { NextResponse } from "next/server";
import { saveQualification } from "@/lib/db";
export const runtime = "nodejs";
type Payload = { category?: string; priority?: string; score?: number; summary?: string; reason?: string; recommendedAction?: string; source?: string };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  if (expectedSecret && request.headers.get("x-internal-api-secret") !== expectedSecret) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try { const leadId = Number((await params).id); if (!Number.isInteger(leadId) || leadId <= 0) return NextResponse.json({ success: false, message: "Invalid lead ID." }, { status: 400 }); const body = await request.json() as Payload; const score = Math.max(0, Math.min(100, Number(body.score) || 0)); const priority = score >= 80 ? "High" : score >= 55 ? "Medium" : "Low"; const saved = await saveQualification(leadId, { category: body.category || "General", score, summary: body.summary || "", reason: body.reason || "", recommendedAction: body.recommendedAction || "Review manually.", source: body.source || "n8n" }); if (!saved) return NextResponse.json({ success: false, message: "Lead not found." }, { status: 404 }); return NextResponse.json({ success: true, message: "Lead qualification saved.", leadId, qualification: { category: body.category || "General", priority, score } }); } catch { return NextResponse.json({ success: false, message: "Could not update lead qualification." }, { status: 500 }); }
}
