#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -d node_modules ]]; then
  echo "[ihaleal.com] npm install..."
  npm install
fi
if [[ ! -f public/icon-192.png ]]; then
  echo "[ihaleal.com] npm run gen:assets..."
  npm run gen:assets
fi
echo "[ihaleal.com] http://localhost:5173"
exec npm run dev
