CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL,
  description TEXT NOT NULL, budget TEXT DEFAULT '', timeline TEXT DEFAULT '',
  source TEXT DEFAULT 'Website', score INTEGER NOT NULL, category TEXT NOT NULL,
  priority TEXT NOT NULL, summary TEXT NOT NULL, follow_up TEXT NOT NULL,
  status TEXT DEFAULT 'new', automation_triggered INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
