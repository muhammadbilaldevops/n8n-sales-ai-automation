import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { Lead } from "./types";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "leadflow.db"));
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL, description TEXT NOT NULL, budget TEXT DEFAULT '', timeline TEXT DEFAULT '', source TEXT DEFAULT 'Website', score INTEGER NOT NULL, category TEXT NOT NULL, priority TEXT NOT NULL, summary TEXT NOT NULL, follow_up TEXT NOT NULL, status TEXT DEFAULT 'new', automation_triggered INTEGER DEFAULT 0, created_at TEXT NOT NULL);`);
export function listLeads(): Lead[] { return db.prepare(`SELECT id,name,email,company,description,budget,timeline,source,score,category,priority,summary,follow_up as followUp,status,automation_triggered as automationTriggered,created_at as createdAt FROM leads ORDER BY id DESC`).all() as Lead[]; }
export default db;
