// ============================================================================
// Capa de acceso a SQLite (better-sqlite3, síncrono). Singleton por proceso.
// ============================================================================

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
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

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "porra.db");

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  const schema = fs.readFileSync(
    path.join(process.cwd(), "data", "schema.sql"),
    "utf8"
  );
  conn.exec(schema);
  _db = conn;
  return conn;
}

function emptyPrediction(): Prediction {
  return { groups: emptyGroups(), thirds: [], bracket: emptyBracket() };
}

function rowToPrediction(row: any): Prediction {
  if (!row) return emptyPrediction();
  return {
    groups: JSON.parse(row.groups_json),
    thirds: JSON.parse(row.thirds_json),
    bracket: JSON.parse(row.bracket_json),
  };
}

// ---------- Usuarios ----------

export function createUser(id: string, name: string, email?: string): User {
  const created_at = new Date().toISOString();
  db()
    .prepare("INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)")
    .run(id, name, email || null, created_at);
  return { id, name, email: email || null, created_at };
}

export function getUser(id: string): User | undefined {
  return db().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}

// ---------- Predicciones ----------

export function getPrediction(userId: string): Prediction {
  const row = db()
    .prepare("SELECT * FROM predictions WHERE user_id = ?")
    .get(userId);
  return rowToPrediction(row);
}

export function savePrediction(userId: string, pred: Prediction): void {
  const updated_at = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO predictions (user_id, groups_json, thirds_json, bracket_json, updated_at)
       VALUES (@user_id, @groups_json, @thirds_json, @bracket_json, @updated_at)
       ON CONFLICT(user_id) DO UPDATE SET
         groups_json = excluded.groups_json,
         thirds_json = excluded.thirds_json,
         bracket_json = excluded.bracket_json,
         updated_at = excluded.updated_at`
    )
    .run({
      user_id: userId,
      groups_json: JSON.stringify(pred.groups),
      thirds_json: JSON.stringify(pred.thirds),
      bracket_json: JSON.stringify(pred.bracket),
      updated_at,
    });
}

export function getAllPredictions(): { user: User; prediction: Prediction }[] {
  const rows = db()
    .prepare(
      `SELECT u.id, u.name, u.email, u.created_at,
              p.groups_json, p.thirds_json, p.bracket_json
       FROM users u
       JOIN predictions p ON p.user_id = u.id`
    )
    .all() as any[];
  return rows.map((row) => ({
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: row.created_at,
    },
    prediction: rowToPrediction(row),
  }));
}

// ---------- Resultados reales (fila única, admin) ----------

export function getResults(): Prediction {
  const row = db().prepare("SELECT * FROM results WHERE id = 1").get();
  return rowToPrediction(row);
}

export function hasResults(): boolean {
  const row = db().prepare("SELECT id FROM results WHERE id = 1").get();
  return !!row;
}

export function saveResults(res: Prediction): void {
  const updated_at = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO results (id, groups_json, thirds_json, bracket_json, updated_at)
       VALUES (1, @groups_json, @thirds_json, @bracket_json, @updated_at)
       ON CONFLICT(id) DO UPDATE SET
         groups_json = excluded.groups_json,
         thirds_json = excluded.thirds_json,
         bracket_json = excluded.bracket_json,
         updated_at = excluded.updated_at`
    )
    .run({
      groups_json: JSON.stringify(res.groups),
      thirds_json: JSON.stringify(res.thirds),
      bracket_json: JSON.stringify(res.bracket),
      updated_at,
    });
}
