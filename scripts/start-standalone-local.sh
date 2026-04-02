#!/bin/sh
# Run after `npm run build` when using output: "standalone" (matches Docker layout).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! test -f .next/standalone/server.js; then
  echo "Missing .next/standalone/server.js — run npm run build first."
  exit 1
fi
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -R public .next/standalone/public
cd .next/standalone
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"
exec node server.js
