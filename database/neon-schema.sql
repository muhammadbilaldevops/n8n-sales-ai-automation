-- Optional: the app creates this table automatically on first use.
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL,
  description TEXT NOT NULL, budget TEXT DEFAULT '', timeline TEXT DEFAULT '',
  source TEXT DEFAULT 'Website', score INTEGER NOT NULL, category TEXT NOT NULL,
  priority TEXT NOT NULL, summary TEXT NOT NULL, follow_up TEXT NOT NULL,
  status TEXT DEFAULT 'new', automation_triggered INTEGER DEFAULT 0,
  ai_reason TEXT DEFAULT '', ai_recommended_action TEXT DEFAULT '',
  ai_qualified_at TEXT, qualification_source TEXT, created_at TEXT NOT NULL
);
