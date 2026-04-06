import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");

/** Load DATABASE_URL from project `.env` (no dotenv dependency). */
export function loadDatabaseUrl(): string {
  const envPath = join(root, ".env");
  if (!existsSync(envPath)) {
    throw new Error(`Missing ${envPath}. Copy .env.example and set DATABASE_URL.`);
  }
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^DATABASE_URL=(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!v) continue;
    return v;
  }
  throw new Error("DATABASE_URL not found in .env");
}

export function parseMysqlUrl(urlStr: string): {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
} {
  const u = new URL(urlStr);
  if (u.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use mysql:// scheme");
  }
  const database = u.pathname.replace(/^\//, "").split("/")[0];
  if (!database) {
    throw new Error("DATABASE_URL must include a database name in the path");
  }
  return {
    host: u.hostname,
    port: u.port || "3306",
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
  };
}

export const projectRoot = root;
