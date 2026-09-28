#!/usr/bin/env bash
# Export the Sanity dataset (documents + image assets) to backups/.
# Restore with: npx sanity datasets import <file>.tar.gz <dataset> -p <projectId> --replace
# See docs/DISASTER_RECOVERY.md.
set -euo pipefail

cd "$(dirname "$0")/.."

# Pick up local env when run by hand; CI provides these as env vars.
if [[ -f .env.local ]]; then
  set -a; source .env.local; set +a
fi

: "${NEXT_PUBLIC_SANITY_PROJECT_ID:?NEXT_PUBLIC_SANITY_PROJECT_ID is not set}"
DATASET="${NEXT_PUBLIC_SANITY_DATASET:-production}"
OUT_DIR="${BACKUP_DIR:-backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$OUT_DIR/sanity-$DATASET-$STAMP.tar.gz"

mkdir -p "$OUT_DIR"
npx sanity datasets export "$DATASET" "$OUT" -p "$NEXT_PUBLIC_SANITY_PROJECT_ID" --overwrite
echo "Backup written to $OUT"
