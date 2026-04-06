/**
 * Restores a mysqldump produced by db-backup.ts. Replaces tables in the target database
 * (dump includes DROP TABLE). Use only when you intend to reload a saved snapshot.
 *
 *   npx tsx scripts/db-restore.ts ./backups/luxpads-2026-04-01T12-00-00.sql
 *   npx tsx scripts/db-restore.ts --docker ./backups/luxpads-....sql
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { loadDatabaseUrl, parseMysqlUrl, projectRoot } from "./db-env.js";

const DOCKER_DB_USER = process.env.DOCKER_MYSQL_USER ?? "luxpads";
const DOCKER_DB_PASSWORD = process.env.DOCKER_MYSQL_PASSWORD ?? "luxpads";
const DOCKER_DB_NAME = process.env.DOCKER_MYSQL_DATABASE ?? "luxpads";

function main() {
  const raw = process.argv.slice(2);
  const useDocker = raw.includes("--docker");
  const file = raw.filter((a) => a !== "--docker")[0] ?? process.env.BACKUP_FILE;
  if (!file) {
    console.error("Usage: npx tsx scripts/db-restore.ts [--docker] <path-to.sql>");
    process.exit(1);
  }
  if (!existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const sql = readFileSync(file, "utf8");

  let r: ReturnType<typeof spawnSync>;
  let where: string;

  if (useDocker) {
    where = `${DOCKER_DB_NAME} (docker compose service db)`;
    r = spawnSync(
      "docker",
      [
        "compose",
        "exec",
        "-T",
        "db",
        "mysql",
        `-u${DOCKER_DB_USER}`,
        `-p${DOCKER_DB_PASSWORD}`,
        DOCKER_DB_NAME,
      ],
      {
        input: sql,
        encoding: "utf8",
        maxBuffer: 512 * 1024 * 1024,
        cwd: projectRoot,
      },
    );
  } else {
    const creds = parseMysqlUrl(loadDatabaseUrl());
    where = `${creds.database}@${creds.host}:${creds.port}`;
    r = spawnSync(
      "mysql",
      ["-h", creds.host, "-P", creds.port, "-u", creds.user, `--password=${creds.password}`, creds.database],
      {
        input: sql,
        encoding: "utf8",
        maxBuffer: 512 * 1024 * 1024,
      },
    );
  }

  if (r.error) {
    console.error(r.error.message);
    if (useDocker) {
      console.error("Is Docker running? Try: docker compose up -d db");
    } else {
      console.error("Install MySQL client tools so `mysql` is on PATH, or use --docker.");
    }
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error(r.stderr || "mysql restore failed");
    process.exit(r.status ?? 1);
  }

  console.log(`Restored ${file} into ${where}`);
}

main();
