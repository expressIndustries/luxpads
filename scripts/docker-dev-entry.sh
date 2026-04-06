#!/bin/sh
# Used by docker compose service `app-dev` (profile dev). Bind-mounts source; keeps node_modules in a volume.
set -e
cd /app
apk add --no-cache libc6-compat openssl >/dev/null

if [ ! -d node_modules/next ]; then
  echo "luxpads dev: installing npm dependencies (first run or empty volume)…"
  npm ci
fi

npx prisma generate
exec npm run dev
