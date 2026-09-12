import { NextResponse } from "next/server";
import { createLead, listLeads, markAutomationTriggered } from "@/lib/db";
import { enrichLead } from "@/lib/ai";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ leads: await listLeads() }); }
export async function POST(request: Request) {
  try {
    const body = await request.json(); const { name, email, company, description, budget = "", timeline = "", source = "Website" } = body;
    if (![name, email, company, description].every((x) => typeof x === "string" && x.trim())) return NextResponse.json({ success: false, message: "Name, email, company, and project details are required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    const insight = enrichLead({ description, budget, timeline }); const leadId = await createLead({ name: name.trim(), email: email.trim(), company: company.trim(), description: description.trim(), budget, timeline, source, score: insight.score, category: insight.category, priority: insight.priority, summary: insight.summary, followUp: insight.followUp, status: insight.priority === "High" ? "qualified" : "new", createdAt: new Date().toISOString() }); let automationTriggered = false;
    if (process.env.N8N_WEBHOOK_URL) { try { const response = await fetch(process.env.N8N_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, name, email, company, description, budget, timeline, source, ...insight }) }); automationTriggered = response.ok; } catch { /* Lead remains safely saved when automation is offline. */ } }
    if (automationTriggered) await markAutomationTriggered(leadId);
    return NextResponse.json({ success: true, leadId, insight, automationTriggered, message: automationTriggered ? "Lead saved and n8n automation triggered." : "Lead saved. Demo Mode generated the AI insight." });
  } catch { return NextResponse.json({ success: false, message: "Unable to save this lead. Please try again." }, { status: 500 }); }
}
