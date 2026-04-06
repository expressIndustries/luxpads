/**
 * Full logical backup of the LuxPads MySQL database (data-preserving for the dump file).
 * Does not run seed or reset. Use before testing risky flows; pair with db-restore.ts to reload.
 *
 *   npx tsx scripts/db-backup.ts
 *   npx tsx scripts/db-backup.ts ./my-snapshot.sql
 *
 * If host `mysqldump` fails (e.g. auth plugin mismatch with Docker MySQL), use:
 *   npx tsx scripts/db-backup.ts --docker
 * (runs mysqldump inside `docker compose` service `db`; uses compose DB user/password.)
 */
import { closeSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { loadDatabaseUrl, parseMysqlUrl, projectRoot } from "./db-env.js";

/** Defaults match `docker-compose.yml` service `db`. */
const DOCKER_DB_USER = process.env.DOCKER_MYSQL_USER ?? "luxpads";
const DOCKER_DB_PASSWORD = process.env.DOCKER_MYSQL_PASSWORD ?? "luxpads";
const DOCKER_DB_NAME = process.env.DOCKER_MYSQL_DATABASE ?? "luxpads";

function main() {
  const argv = process.argv.slice(2).filter((a) => a !== "--docker");
  const useDocker = process.argv.slice(2).includes("--docker");
  const outArg = argv[0];
  const backupsDir = join(projectRoot, "backups");
  mkdirSync(backupsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outPath = outArg ?? join(backupsDir, `luxpads-${stamp}.sql`);

  const fd = openSync(outPath, "w");
  let r: ReturnType<typeof spawnSync>;
  try {
    if (useDocker) {
      r = spawnSync(
        "docker",
        [
          "compose",
          "exec",
          "-T",
          "db",
          "mysqldump",
          `-u${DOCKER_DB_USER}`,
          `-p${DOCKER_DB_PASSWORD}`,
          "--single-transaction",
          "--routines",
          "--triggers",
          "--add-drop-table",
          DOCKER_DB_NAME,
        ],
        { stdio: ["ignore", fd, "pipe"], encoding: "utf8", cwd: projectRoot },
      );
    } else {
      const creds = parseMysqlUrl(loadDatabaseUrl());
      const dumpArgs = [
        "-h",
        creds.host,
        "-P",
        creds.port,
        "-u",
        creds.user,
        `--password=${creds.password}`,
        "--single-transaction",
        "--routines",
        "--triggers",
        "--add-drop-table",
        creds.database,
      ];
      r = spawnSync("mysqldump", dumpArgs, { stdio: ["ignore", fd, "pipe"], encoding: "utf8" });
    }
  } finally {
    closeSync(fd);
  }

  if (r.error) {
    console.error(r.error.message);
    if (useDocker) {
      console.error("Is Docker running? Try: docker compose up -d db");
    } else {
      console.error("Install MySQL client tools so `mysqldump` is on PATH, or use --docker.");
    }
    process.exit(1);
  }
  if (r.status !== 0) {
    console.error(r.stderr || "mysqldump failed");
    process.exit(r.status ?? 1);
  }

  console.log(`Wrote ${outPath}`);
}

main();
