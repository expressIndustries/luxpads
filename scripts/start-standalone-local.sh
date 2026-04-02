#!/bin/sh
# Run after `npm run build` when using output: "standalone" (matches Docker layout).
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
sh "$ROOT/scripts/sync-standalone-assets.sh"
cd .next/standalone
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"
exec node server.js
