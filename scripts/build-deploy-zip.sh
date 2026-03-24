#!/usr/bin/env bash
# Build luxpads-deploy-*.zip for uploading to a server (excludes build artifacts and secrets).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_NAME="${1:-luxpads-deploy-${STAMP}.zip}"
if [[ "$OUT_NAME" = /* ]]; then
  OUT_ABS="$OUT_NAME"
else
  OUT_ABS="${REPO_ROOT}/${OUT_NAME}"
fi

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

STAGE="${TMP}/luxpads"
mkdir -p "$STAGE"

rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='out/' \
  --exclude='coverage/' \
  --exclude='.vercel/' \
  --exclude='*.tsbuildinfo' \
  --exclude='.DS_Store' \
  --exclude='*.pem' \
  --exclude='npm-debug.log*' \
  --exclude='yarn-debug.log*' \
  --exclude='yarn-error.log*' \
  --exclude='.pnpm-debug.log*' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.development' \
  --exclude='.env.production' \
  --exclude='.env.test' \
  --exclude='public/uploads/' \
  --exclude='luxpads-deploy-*.zip' \
  --exclude='luxpads-deploy.zip' \
  "${REPO_ROOT}/" "${STAGE}/"

chmod +x "${STAGE}/deploy.sh" 2>/dev/null || true
chmod +x "${STAGE}/docker-entrypoint.sh" 2>/dev/null || true
chmod +x "${STAGE}/scripts/build-deploy-zip.sh" 2>/dev/null || true

(
  cd "$TMP"
  zip -r -q "$OUT_ABS" luxpads
)

echo "Wrote $OUT_ABS"
echo "On the server (Node 20.9+ + MySQL): prefer a clean dir (rm -rf luxpads) before unzip so"
echo "  deleted files from older releases are gone; then: unzip $(basename "$OUT_ABS") && cd luxpads && ./deploy.sh && ./deploy.sh start"
echo "Production: use deploy/luxpads.service.example + Apache example in deploy/"
