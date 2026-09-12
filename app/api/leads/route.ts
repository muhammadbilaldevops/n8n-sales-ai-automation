import { NextResponse } from "next/server";
import db, { listLeads } from "@/lib/db";
import { enrichLead } from "@/lib/ai";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ leads: listLeads() }); }
export async function POST(request: Request) {
  try {
    const body = await request.json(); const { name, email, company, description, budget = "", timeline = "", source = "Website" } = body;
    if (![name, email, company, description].every((x) => typeof x === "string" && x.trim())) return NextResponse.json({ success: false, message: "Name, email, company, and project details are required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    const insight = enrichLead({ description, budget, timeline }); const result = db.prepare(`INSERT INTO leads (name,email,company,description,budget,timeline,source,score,category,priority,summary,follow_up,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(name.trim(), email.trim(), company.trim(), description.trim(), budget, timeline, source, insight.score, insight.category, insight.priority, insight.summary, insight.followUp, insight.priority === "High" ? "qualified" : "new", new Date().toISOString());
    const leadId = Number(result.lastInsertRowid); let automationTriggered = false;
    if (process.env.N8N_WEBHOOK_URL) { try { const response = await fetch(process.env.N8N_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, name, email, company, description, budget, timeline, source, ...insight }) }); automationTriggered = response.ok; } catch { /* Lead remains safely saved when automation is offline. */ } }
    if (automationTriggered) db.prepare("UPDATE leads SET automation_triggered = 1 WHERE id = ?").run(leadId);
    return NextResponse.json({ success: true, leadId, insight, automationTriggered, message: automationTriggered ? "Lead saved and n8n automation triggered." : "Lead saved. Demo Mode generated the AI insight." });
  } catch { return NextResponse.json({ success: false, message: "Unable to save this lead. Please try again." }, { status: 500 }); }
}
