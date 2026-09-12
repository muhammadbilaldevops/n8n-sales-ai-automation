export function enrichLead(input: { description: string; budget?: string; timeline?: string }) {
  const text = `${input.description} ${input.budget ?? ""} ${input.timeline ?? ""}`.toLowerCase();
  const budget = /\$?\s?(?:[5-9]\d{3}|[1-9]\d{4,}|\d{1,3}(?:,\d{3})+|\d+\s?k)/.test(text);
  const urgent = /(urgent|asap|this week|immediately|rush)/.test(text);
  const ecommerce = /(ecommerce|shop|store|woocommerce|shopify)/.test(text);
  const automation = /(automation|crm|workflow|n8n|integration)/.test(text);
  const ai = /(ai|chatbot|llm|agent)/.test(text);
  const score = Math.min(100, 35 + (budget ? 25 : 0) + (urgent ? 20 : 0) + (input.description.length > 100 ? 10 : 0) + (ai || automation ? 10 : 0));
  const category = ecommerce ? "E-commerce" : automation ? "Automation" : ai ? "AI solution" : "Web project";
  const priority = score >= 70 ? "High" : score >= 50 ? "Medium" : "Low" as const;
  const summary = `${category} inquiry${urgent ? " with an urgent timeline" : ""}${budget ? " and a stated budget signal" : ""}.`;
  const followUp = priority === "High" ? "Thanks for reaching out — I’d love to schedule a 20-minute discovery call this week." : "Thanks for your inquiry. I’ll review the requirements and send helpful next steps shortly.";
  return { score, category, priority, summary, followUp };
}
