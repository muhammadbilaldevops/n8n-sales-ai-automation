import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Lead } from "./types";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "leadflow.db"));
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL, description TEXT NOT NULL, budget TEXT DEFAULT '', timeline TEXT DEFAULT '', source TEXT DEFAULT 'Website', score INTEGER NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL, summary TEXT NOT NULL, follow_up TEXT NOT NULL, status TEXT DEFAULT 'new', automation_triggered INTEGER DEFAULT 0, ai_reason TEXT DEFAULT '', ai_recommended_action TEXT DEFAULT '', ai_qualified_at TEXT, qualification_source TEXT, created_at TEXT NOT NULL);`);
const existingColumns = new Set((db.prepare("PRAGMA table_info(leads)").all() as Array<{ name: string }>).map((column) => column.name));
for (const migration of [
  ["ai_reason", "ALTER TABLE leads ADD COLUMN ai_reason TEXT DEFAULT ''"],
  ["ai_recommended_action", "ALTER TABLE leads ADD COLUMN ai_recommended_action TEXT DEFAULT ''"],
  ["ai_qualified_at", "ALTER TABLE leads ADD COLUMN ai_qualified_at TEXT"],
  ["qualification_source", "ALTER TABLE leads ADD COLUMN qualification_source TEXT"],
] as const) if (!existingColumns.has(migration[0])) db.exec(migration[1]);
export function listLeads(): Lead[] { return db.prepare(`SELECT id,name,email,company,description,budget,timeline,source,score,category,priority,summary,follow_up as followUp,status,automation_triggered as automationTriggered,ai_reason as aiReason,ai_recommended_action as aiRecommendedAction,ai_qualified_at as aiQualifiedAt,qualification_source as qualificationSource,created_at as createdAt FROM leads ORDER BY id DESC`).all() as Lead[]; }
export default db;
