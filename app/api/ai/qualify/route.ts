import { NextResponse } from "next/server";

type LeadInput = { leadId?: number; name?: string; email?: string; company?: string; description?: string; budget?: string; timeline?: string };
type Qualification = { category: string; score: number; priority: "High" | "Medium" | "Low"; summary: string; reason: string; recommendedAction: string };
const clamp = (value: unknown) => Math.max(0, Math.min(100, Number(value) || 0));
function fallback(lead: LeadInput): Qualification {
  const text = `${lead.description ?? ""} ${lead.budget ?? ""} ${lead.timeline ?? ""}`.toLowerCase();
  const urgent = /(urgent|asap|this week|immediately)/.test(text), budget = /(\$?\s?(?:[5-9]\d{3}|[1-9]\d{4,}|\d{1,3}(?:,\d{3})+|\d+\s?k))/.test(text);
  const category = /(automation|n8n|crm|integration)/.test(text) ? "Automation" : /(ai|llm|chatbot|agent)/.test(text) ? "AI solution" : /(website|web|ecommerce|shopify)/.test(text) ? "Web development" : "General";
  const score = Math.min(100, 35 + (budget ? 25 : 0) + (urgent ? 20 : 0) + (lead.description && lead.description.length > 100 ? 10 : 0) + (category !== "General" ? 10 : 0));
  const priority = score >= 80 ? "High" : score >= 55 ? "Medium" : "Low" as const;
  return { category, score, priority, summary: `${category} request qualified using local fallback rules.`, reason: `${budget ? "Budget signal" : "No clear budget"}${urgent ? " and an urgent timeline" : ""} informed the score.`, recommendedAction: priority === "High" ? "Contact this lead as soon as possible." : priority === "Medium" ? "Review and send a follow-up within one business day." : "Add to the standard follow-up queue." };
}
export async function POST(request: Request) {
  let lead: LeadInput = {};
  try {
    lead = await request.json();
    if (!lead.name || !lead.email || !lead.description) return NextResponse.json({ success: false, message: "Name, email, and description are required." }, { status: 400 });
    const prompt = `Return only valid JSON with category, score (0-100), priority (high, medium, low), summary, reason, recommendedAction. Do not invent facts. Qualify this sales lead:\nName: ${lead.name}\nCompany: ${lead.company || "Not provided"}\nDescription: ${lead.description}\nBudget: ${lead.budget || "Not provided"}\nTimeline: ${lead.timeline || "Not provided"}`;
    const response = await fetch(process.env.OLLAMA_URL ?? "http://localhost:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? "llama3.2:3b", prompt, stream: false, format: "json", options: { temperature: 0.1 } }), signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("Ollama unavailable");
    const raw = await response.json() as { response?: string }; const parsed = JSON.parse(raw.response ?? "{}") as Partial<Qualification>; const score = clamp(parsed.score);
    const qualification: Qualification = { category: parsed.category || "General", score, priority: score >= 80 ? "High" : score >= 55 ? "Medium" : "Low", summary: parsed.summary || "Lead qualified by local AI.", reason: parsed.reason || "The local model did not provide a reason.", recommendedAction: parsed.recommendedAction || "Review the lead and choose the next action." };
    return NextResponse.json({ success: true, leadId: lead.leadId, source: "ollama-local", qualification });
  } catch { return NextResponse.json({ success: true, leadId: lead.leadId, source: "fallback-rules", qualification: fallback(lead) }); }
}
