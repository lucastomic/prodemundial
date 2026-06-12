// Crea el esquema en la base Turso remota. Credenciales por variables de entorno.
import { createClient } from "@libsql/client";
import fs from "node:fs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN");
  process.exit(1);
}

const schema = fs.readFileSync("data/schema.sql", "utf8");
const client = createClient({ url, authToken });

await client.executeMultiple(schema);
const tables = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log("OK tablas:", tables.rows.map((r) => r.name).join(", "));
