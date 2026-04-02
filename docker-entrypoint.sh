#!/bin/sh
set -e
# First invocation may be as root (see Dockerfile) so we can chown mounted upload volumes.
if [ "$(id -u)" = "0" ]; then
  UP_ROOT="${LUXPADS_UPLOADS_ROOT:-/app/public/uploads}"
  mkdir -p "$UP_ROOT/listings"
  chown -R nextjs:nodejs "$UP_ROOT"
  exec su-exec nextjs:nodejs "$0" "$@"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "error: DATABASE_URL is not set"
  exit 1
fi
echo "Running Prisma migrations..."
prisma migrate deploy
echo "Starting Next.js..."
exec node server.js
