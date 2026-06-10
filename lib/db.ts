// ============================================================================
// Capa de acceso a la base de datos (libSQL / Turso, asíncrono).
//
// - En local: usa un fichero SQLite (TURSO_DATABASE_URL=file:./data/porra.db).
// - En producción (Vercel): apunta a una base Turso remota mediante
//   TURSO_DATABASE_URL=libsql://... y TURSO_AUTH_TOKEN=...
// El esquema se crea de forma perezosa (idempotente) en la primera consulta.
// ============================================================================

import { createClient, type Client } from "@libsql/client";
import { Bracket, Groups, emptyBracket, emptyGroups } from "@/lib/bracket";

export type Prediction = {
  groups: Groups;
  thirds: string[];
  bracket: Bracket;
};

export type User = {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS predictions (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  groups_json  TEXT NOT NULL,
  thirds_json  TEXT NOT NULL,
  bracket_json TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  groups_json  TEXT,
  thirds_json  TEXT,
  bracket_json TEXT,
  updated_at   TEXT
);
`;

let _client: Client | null = null;
let _ready: Promise<Client> | null = null;

function rawClient(): Client {
  if (_client) return _client;
  // Compat: si solo está DB_PATH (modo antiguo), se interpreta como fichero local.
  const url =
    process.env.TURSO_DATABASE_URL ||
    (process.env.DB_PATH ? `file:${process.env.DB_PATH}` : "file:./data/porra.db");
  const authToken = process.env.TURSO_AUTH_TOKEN;
  _client = createClient({ url, authToken });
  return _client;
}

// Devuelve el cliente garantizando que el esquema existe (una sola vez por proceso).
function db(): Promise<Client> {
  if (_ready) return _ready;
  _ready = (async () => {
    const c = rawClient();
    await c.executeMultiple(SCHEMA);
    return c;
  })();
  return _ready;
}

function emptyPrediction(): Prediction {
  return { groups: emptyGroups(), thirds: [], bracket: emptyBracket() };
}

function rowToPrediction(row: any): Prediction {
  if (!row) return emptyPrediction();
  return {
    groups: JSON.parse(row.groups_json as string),
    thirds: JSON.parse(row.thirds_json as string),
    bracket: JSON.parse(row.bracket_json as string),
  };
}

// ---------- Usuarios ----------

export async function createUser(
  id: string,
  name: string,
  email?: string
): Promise<User> {
  const created_at = new Date().toISOString();
  const c = await db();
  await c.execute({
    sql: "INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)",
    args: [id, name, email || null, created_at],
  });
  return { id, name, email: email || null, created_at };
}

export async function getUser(id: string): Promise<User | undefined> {
  const c = await db();
  const r = await c.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  const row = r.rows[0] as any;
  if (!row) return undefined;
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

// ---------- Predicciones ----------

export async function getPrediction(userId: string): Promise<Prediction> {
  const c = await db();
  const r = await c.execute({
    sql: "SELECT * FROM predictions WHERE user_id = ?",
    args: [userId],
  });
  return rowToPrediction(r.rows[0]);
}

// ¿El usuario ya guardó su porra? (la porra es definitiva tras guardarla)
export async function hasPrediction(userId: string): Promise<boolean> {
  const c = await db();
  const r = await c.execute({
    sql: "SELECT 1 FROM predictions WHERE user_id = ?",
    args: [userId],
  });
  return r.rows.length > 0;
}

export async function savePrediction(
  userId: string,
  pred: Prediction
): Promise<void> {
  const updated_at = new Date().toISOString();
  const c = await db();
  await c.execute({
    sql: `INSERT INTO predictions (user_id, groups_json, thirds_json, bracket_json, updated_at)
          VALUES (:user_id, :groups_json, :thirds_json, :bracket_json, :updated_at)
          ON CONFLICT(user_id) DO UPDATE SET
            groups_json = excluded.groups_json,
            thirds_json = excluded.thirds_json,
            bracket_json = excluded.bracket_json,
            updated_at = excluded.updated_at`,
    args: {
      user_id: userId,
      groups_json: JSON.stringify(pred.groups),
      thirds_json: JSON.stringify(pred.thirds),
      bracket_json: JSON.stringify(pred.bracket),
      updated_at,
    },
  });
}

export async function getAllPredictions(): Promise<
  { user: User; prediction: Prediction }[]
> {
  const c = await db();
  const r = await c.execute(
    `SELECT u.id, u.name, u.email, u.created_at,
            p.groups_json, p.thirds_json, p.bracket_json
     FROM users u
     JOIN predictions p ON p.user_id = u.id`
  );
  return (r.rows as any[]).map((row) => ({
    user: {
      id: row.id as string,
      name: row.name as string,
      email: (row.email as string | null) ?? null,
      created_at: row.created_at as string,
    },
    prediction: rowToPrediction(row),
  }));
}

// ---------- Resultados reales (fila única, admin) ----------

export async function getResults(): Promise<Prediction> {
  const c = await db();
  const r = await c.execute("SELECT * FROM results WHERE id = 1");
  return rowToPrediction(r.rows[0]);
}

export async function hasResults(): Promise<boolean> {
  const c = await db();
  const r = await c.execute("SELECT id FROM results WHERE id = 1");
  return r.rows.length > 0;
}

export async function saveResults(res: Prediction): Promise<void> {
  const updated_at = new Date().toISOString();
  const c = await db();
  await c.execute({
    sql: `INSERT INTO results (id, groups_json, thirds_json, bracket_json, updated_at)
          VALUES (1, :groups_json, :thirds_json, :bracket_json, :updated_at)
          ON CONFLICT(id) DO UPDATE SET
            groups_json = excluded.groups_json,
            thirds_json = excluded.thirds_json,
            bracket_json = excluded.bracket_json,
            updated_at = excluded.updated_at`,
    args: {
      groups_json: JSON.stringify(res.groups),
      thirds_json: JSON.stringify(res.thirds),
      bracket_json: JSON.stringify(res.bracket),
      updated_at,
    },
  });
}
