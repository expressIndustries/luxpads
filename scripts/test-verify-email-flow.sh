#!/usr/bin/env bash
# Exercise verify-email HTTP behavior against a running app (default http://127.0.0.1:3000).
# Run: ./scripts/test-verify-email-flow.sh
# Or:  ./scripts/test-verify-email-flow.sh https://luxpads.co
set -euo pipefail
BASE="${1:-http://127.0.0.1:3000}"

echo "== POST /api/verify-email/complete (empty JSON) → 400 missing"
code=$(curl -sS -o /tmp/ve1.json -w "%{http_code}" -X POST "$BASE/api/verify-email/complete" \
  -H "Content-Type: application/json" -d '{}')
echo "status=$code body=$(cat /tmp/ve1.json)"
test "$code" = "400"

echo "== POST /api/verify-email/complete (bad token) → 410"
code=$(curl -sS -o /tmp/ve2.json -w "%{http_code}" -X POST "$BASE/api/verify-email/complete" \
  -H "Content-Type: application/json" -d '{"token":"deadbeefnotreal"}')
echo "status=$code body=$(cat /tmp/ve2.json)"
test "$code" = "410"

echo "== GET /api/verify-email (no token) → redirect login"
curl -sS -o /dev/null -w "status=%{http_code} location=%{redirect_url}\n" "$BASE/api/verify-email"

echo "== GET /api/verify-email?token=abc → 200 HTML with verify-email# in script"
code=$(curl -sS -o /tmp/ve3.html -w "%{http_code}" "$BASE/api/verify-email?token=abc")
echo "status=$code"
test "$code" = "200"
grep -q 'verify-email#' /tmp/ve3.html
grep -q 'location.replace' /tmp/ve3.html

echo "== GET /verify-email → 200 (HTML page shell)"
code=$(curl -sS -o /tmp/ve4.html -w "%{http_code}" "$BASE/verify-email")
echo "status=$code"
test "$code" = "200"

echo "OK — verify-email flow smoke checks passed."
