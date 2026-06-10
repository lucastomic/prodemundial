CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,   -- token aleatorio (también identificador secreto)
  name       TEXT NOT NULL,
  email      TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  groups_json  TEXT NOT NULL,    -- { "A": ["teamId1",...,"teamId4"], ... }
  thirds_json  TEXT NOT NULL,    -- ["teamId", ...] (hasta 8 terceros elegidos)
  bracket_json TEXT NOT NULL,    -- { r32:[16], r16:[8], qf:[4], sf:[2], final:[1] }
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS results (   -- una única fila editada por el admin
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  groups_json  TEXT,
  thirds_json  TEXT,
  bracket_json TEXT,
  updated_at   TEXT
);
