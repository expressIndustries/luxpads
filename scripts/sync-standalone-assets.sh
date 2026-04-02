#!/bin/sh
# Next.js output: "standalone" does not embed public/ or .next/static inside .next/standalone/.
# Copy them in after every `npm run build` before `node .next/standalone/server.js`.
# See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! test -f .next/standalone/server.js; then
  echo "error: .next/standalone/server.js missing — run npm run build first." >&2
  exit 1
fi
if ! test -d .next/static; then
  echo "error: .next/static missing after build." >&2
  exit 1
fi

mkdir -p .next/standalone/.next
rm -rf .next/standalone/public
cp -R public .next/standalone/public
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static
