# LeadFlow AI

A portfolio-grade, local-first AI lead-management CRM. It captures project enquiries, saves them to SQLite, produces explainable qualification insights with no paid AI API, and can send each lead to an n8n webhook.

## What it demonstrates

- Responsive sales dashboard and lead intake UX
- Full-stack Next.js: client form, validation, API routes, persistent local database
- Transparent lead scoring: budget, urgency, request detail, and keywords determine score, category, priority, summary, and suggested follow-up
- Fault-tolerant webhook delivery: an offline n8n instance never loses a lead
- Importable n8n workflow and Docker configuration

## Free local setup

Prerequisites: Node.js 20+, Docker Desktop, and Git.

### 1. Get the app

```powershell
git clone https://github.com/muhammadbilaldevops/n8n-sales-ai-automation.git
cd n8n-sales-ai-automation
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. With `N8N_WEBHOOK_URL` unset, the app runs in useful Demo Mode and still saves and scores leads.

### 2. Start n8n

In a second terminal:

```powershell
cd n8n
docker compose up -d
```

Open http://localhost:5678 and create the initial local account.

### 3. Import the workflow

In n8n select **Workflows → Import from File**, then choose `n8n/workflows/leadflow-intake.json`. Open **LeadFlow Webhook**, click **Listen for test event**, then activate it when ready for normal use.

### 4. Connect the app

For testing, put this in `.env.local` while the workflow listens:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/leadflow-intake
```

For an active workflow, use `http://localhost:5678/webhook/leadflow-intake`. Restart the app after changing this value. Submit a lead and n8n receives the contact data and qualification insight.

## Architecture

```text
Website form → POST /api/leads → SQLite (always saved)
                                  ↓
                           local scoring rules
                                  ↓
                         n8n webhook (optional)
```

## Vercel deployment later, without paid services

The UI and API can deploy to Vercel's free tier, but its filesystem is ephemeral: do **not** use SQLite for production data. Before deploying, replace `lib/db.ts` with a hosted free Postgres adapter, such as Supabase or Neon, and put its connection string in Vercel environment variables. n8n itself must run somewhere publicly reachable; then change `N8N_WEBHOOK_URL` to its HTTPS production webhook.

The local demo is fully free. Public persistence and always-on workflow hosting are separate deployment concerns, so the project avoids falsely claiming that localhost or a Vercel filesystem is production storage.

## Suggested recruiter demo

1. Submit an urgent $5,000 automation project.
2. Show the dashboard: it appears instantly with a high AI score and category.
3. Open n8n executions to show the received webhook payload.
4. Explain that the inspectable scorer is free; n8n makes it easy to swap in Ollama or a hosted LLM later.

## Structure

```text
app/                 Next.js UI and API route
lib/                 SQLite adapter, types, explainable scoring logic
n8n/                 Docker Compose and importable workflow
database/schema.sql  Database reference schema
```

## Recommended next upgrades

- Replace SQLite with hosted Postgres plus authentication before handling real data.
- Add n8n retry/error alerts, email/CRM nodes, and a local Ollama model.
- Add rate limiting, audit logs, tests, and consent fields.
