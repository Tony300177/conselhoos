import { Client } from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(path.join(rootDir, "supabase", "migrations", "0001_initial_schema.sql"), "utf-8");

const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("SUPABASE_DB_URL não definida.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(`
    select tablename from pg_tables
    where schemaname = 'public'
    order by tablename`);
  console.log("Migration aplicada. Tabelas no schema public:");
  for (const row of rows) console.log(" -", row.tablename);
} catch (err) {
  console.error("Falha ao aplicar migration:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}