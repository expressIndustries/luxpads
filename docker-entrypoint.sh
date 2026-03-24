#!/bin/sh
set -e
if [ -z "$DATABASE_URL" ]; then
  echo "error: DATABASE_URL is not set"
  exit 1
fi
echo "Running Prisma migrations..."
prisma migrate deploy
echo "Starting Next.js..."
exec node server.js
