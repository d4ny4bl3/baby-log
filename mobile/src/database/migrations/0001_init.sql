-- -------------------------
-- Sleep
-- -------------------------
CREATE TABLE IF NOT EXISTS sleep (
	id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,

    started_at INTEGER NOT NULL,
    ended_at INTEGER,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,

    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_sleep_child_id ON sleep(child_id);
CREATE INDEX IF NOT EXISTS idx_sleep_started_at ON sleep(started_at);

-- -------------------------
-- Eat
-- -------------------------
CREATE TABLE IF NOT EXISTS eat (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,

    started_at INTEGER NOT NULL,
    amount INTEGER,
    note TEXT,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,

    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_eat_child_id ON eat(child_id);
CREATE INDEX IF NOT EXISTS idx_eat_started_at ON eat(started_at);


-- -------------------------
-- Diaper
-- -------------------------
CREATE TABLE IF NOT EXISTS diaper (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,

    changed_at INTEGER NOT NULL,
    type TEXT,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,

    version INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_diaper_child_id ON diaper(child_id);
CREATE INDEX IF NOT EXISTS idx_diaper_changed_at ON diaper(changed_at);


-- -------------------------
-- Children
-- -------------------------
CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date INTEGER,
	gender TEXT,

    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER,

    version INTEGER NOT NULL DEFAULT 1
);


-- -------------------------
-- App metadata
-- -------------------------
CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);
