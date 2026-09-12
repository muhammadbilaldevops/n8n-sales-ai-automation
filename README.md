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

## Milestone 2: free local AI qualification

Milestone 2 optionally replaces the initial rule-only score with a real local Ollama model. It adds a full loop: **form → SQLite → n8n → Ollama → SQLite update → dashboard**. If Ollama is stopped or missing, the workflow automatically uses transparent fallback rules, so it never blocks a lead.

1. Install [Ollama](https://ollama.com/download), then run:

   ```powershell
   ollama pull llama3.2:3b
   ollama run llama3.2:3b
   ```

   Type `/bye` after the test. Ollama then serves its local API on port `11434`.

2. Restart the Next.js app after copying the updated `.env.example` values to `.env.local`.

3. In n8n, import `n8n/workflows/leadflow-intake.json`. This workflow uses `host.docker.internal`, which is the correct way for Docker-based n8n to reach Next.js running on Windows. Do not use `localhost` inside n8n.

4. Set the website webhook URL in `.env.local`:

   ```env
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/leadflow-intake
   ```

5. Start the workflow, submit a lead, and refresh the dashboard. The record is updated with the local AI summary, score, reason, recommended action, and `qualified` status.

### Verify the local AI endpoint

With the site running locally, send a test request:

```powershell
$body = @{ name = "Ali Khan"; email = "ali@example.com"; company = "Example Solutions"; description = "We need an AI CRM with automated follow-up."; budget = "5000 USD"; timeline = "Urgent" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/ai/qualify -Method Post -ContentType "application/json" -Body $body
```

The response says `ollama-local` when the model is available or `fallback-rules` when it is not.

## Vercel deployment later, without paid services

The UI and API can deploy to Vercel's free tier, but its filesystem is ephemeral: do **not** use SQLite for production data. This project already includes a Neon Postgres adapter; set `DATABASE_URL` in Vercel to use it. n8n itself must run somewhere publicly reachable; then change `N8N_WEBHOOK_URL` to its HTTPS production webhook.

The local demo is fully free. Public persistence and always-on workflow hosting are separate deployment concerns, so the project avoids falsely claiming that localhost or a Vercel filesystem is production storage.

## Make the public Vercel site save leads permanently for free

The app has two database modes from one codebase:

- No `DATABASE_URL`: local SQLite, ideal for learning locally.
- `DATABASE_URL` set: Neon Postgres, ideal for Vercel and recruiter testing.

1. Open your Neon project, choose **Connect**, and copy the complete pooled connection string beginning with `postgresql://`.
2. In Vercel, open the LeadFlow project → **Settings → Environment Variables**.
3. Add this private variable to **Production**, **Preview**, and **Development**:

   ```env
   DATABASE_URL=your-complete-neon-connection-string
   ```

4. Redeploy Vercel. The app creates the `leads` table automatically on its first request. `database/neon-schema.sql` is available if you prefer the Neon SQL Editor.
5. Submit a lead on the public website and refresh the dashboard. It now persists in Neon.

Keep the string private: never commit it to GitHub or put it into client-side code. To use the same cloud data locally, add it to `.env.local` and restart `npm run dev`; remove it to use the local SQLite database again.

| Capability | Always online | Needs your PC running |
| --- | --- | --- |
| Website, dashboard, saved leads, fallback score | Vercel + Neon | No |
| n8n and Ollama local-AI qualification | No | Yes |

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
