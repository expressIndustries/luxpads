#!/usr/bin/env bash
# LuxPads server deploy. Default: Node + MySQL (typical LAMP host: Apache proxies to Node; PHP is not used for this app).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

usage() {
  cat <<'EOF'
LuxPads deploy

This app is Next.js — it needs Node.js 20.9+ and MySQL 8. PHP is not used to run it;
on a LAMP box, Apache usually reverse-proxies to Node (see deploy/apache-luxpads.conf.example).

Commands:
  lamp | install     npm ci, prisma migrate deploy, next build (default if no args)
  pull | update      git reset to origin/main, full lamp rebuild, systemctl restart luxpads
  start              production next start (binds 127.0.0.1:3000; use systemd in production)
  seed               npm run db:seed (optional demo data; needs devDependencies / tsx)
  docker up|down|…   Docker Compose workflow (local or Docker-capable servers)

Examples:
  ./deploy.sh                  # same as ./deploy.sh lamp
  ./deploy.sh pull             # production server: sync git + rebuild + restart service
  ./deploy.sh start            # after lamp, or under systemd
  ./deploy.sh docker up        # build & run via docker compose
EOF
}

require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "error: node is not installed or not on PATH (install Node.js 20.9+; PHP cannot run Next.js)" >&2
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "error: npm is not installed or not on PATH" >&2
    exit 1
  fi
  # Next.js 16 enforces >= 20.9 (20.7.x is not enough).
  if ! node -e '
    const p = process.version.slice(1).split(".").map((x) => parseInt(x, 10));
    const need = [20, 9, 0];
    for (let i = 0; i < 3; i++) {
      const a = p[i] || 0, b = need[i];
      if (a > b) process.exit(0);
      if (a < b) process.exit(1);
    }
    process.exit(0);
  ' 2>/dev/null; then
    echo "error: Node.js 20.9+ required (found $(node -v 2>/dev/null || echo unknown))" >&2
    echo "hint: bump the same major (e.g. 20.18 LTS or 22.x); 20.7 is below Next.js 16’s minimum." >&2
    exit 1
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "error: docker is not installed or not on PATH" >&2
    exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    echo "error: 'docker compose' (v2 plugin) is required" >&2
    exit 1
  fi
}

ensure_env() {
  if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
      cp .env.example .env
      echo "Created .env from .env.example — edit it, then re-run this command."
      echo "For LAMP: set DATABASE_URL to MySQL on this host (e.g. mysql://USER:PASS@127.0.0.1:3306/luxpads) and NEXT_PUBLIC_APP_URL to your public URL."
      echo "For Docker with the bundled db container: use mysql://luxpads:luxpads@db:3306/luxpads or remove DATABASE_URL so compose defaults apply."
    else
      echo "error: no .env and no .env.example in $ROOT" >&2
    fi
    exit 1
  fi
}


do_pull() {
  echo "==> Pulling latest code from origin/main..."
  if ! command -v git >/dev/null 2>&1; then
    echo "error: git is not installed or not on PATH" >&2
    exit 1
  fi
  git fetch origin
  git reset --hard origin/main
  echo ""
  echo "==> Running full rebuild..."
  do_lamp_install
  echo ""
  echo "==> Restarting luxpads service..."
  systemctl restart luxpads
  sleep 3
  systemctl status luxpads --no-pager -l | tail -8
}

do_lamp_install() {
  ensure_env
  require_node
  # Unzip/rsync over an old tree does not delete files removed in git; Next still
  # compiles them and fails (e.g. stripe.ts after dropping the stripe package).
  rm -rf src/app/api/stripe src/app/dashboard/billing src/app/owners/pricing
  rm -f src/lib/stripe.ts src/lib/subscription.ts
  echo "Installing dependencies..."
  npm ci
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Building Next.js..."
  npm run build
  echo "Syncing public + .next/static into .next/standalone (required for output: standalone)..."
  sh "$ROOT/scripts/sync-standalone-assets.sh"
  mkdir -p public/uploads
  # Symlink standalone public/uploads -> real public/uploads so new uploads are served immediately
  rm -rf .next/standalone/public/uploads
  ln -s "$ROOT/public/uploads" .next/standalone/public/uploads
  echo ""
  echo "Build finished. Next steps:"
  echo "  • Put Apache in front: see deploy/apache-luxpads.conf.example (enable proxy modules)."
  echo "  • Run the app: ./deploy.sh start   or install deploy/luxpads.service.example as systemd."
  echo "  • Ensure public/uploads is writable by the user that runs Node."
  echo "  • Sundance page art lives in src/assets/sundance (bundled into .next/static); not public/images/sundance."
}

do_start() {
  ensure_env
  require_node
  export NODE_ENV=production
  exec npm run start:prod
}

do_docker() {
  local sub="${1:-up}"
  shift || true
  case "$sub" in
    -h|--help|help)
      echo "Usage: $0 docker [up|down|logs|ps|seed]"
      exit 0
      ;;
    up|"")
      require_docker
      ensure_env
      echo "Building and starting LuxPads (docker compose)..."
      docker compose up -d --build
      echo ""
      docker compose ps
      echo ""
      echo "Optional: $0 docker seed   Logs: $0 docker logs"
      ;;
    down)
      require_docker
      docker compose down
      ;;
    logs)
      require_docker
      docker compose logs -f app
      ;;
    ps)
      require_docker
      docker compose ps
      ;;
    seed)
      require_docker
      docker compose exec app npx prisma db seed
      ;;
    *)
      echo "error: unknown docker command: $sub" >&2
      echo "Usage: $0 docker [up|down|logs|ps|seed]" >&2
      exit 1
      ;;
  esac
}

cmd="${1:-lamp}"

case "$cmd" in
  -h|--help|help)
    usage
    exit 0
    ;;
  lamp|node|install)
    do_lamp_install
    ;;
  pull|update)
    do_pull
    ;;
  start)
    do_start
    ;;
  seed)
    ensure_env
    require_node
    npm run db:seed
    ;;
  docker)
    shift || true
    do_docker "$@"
    ;;
  *)
    echo "error: unknown command: $cmd" >&2
    usage >&2
    exit 1
    ;;
esac
