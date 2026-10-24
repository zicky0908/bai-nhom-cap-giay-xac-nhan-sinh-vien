#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
python -m pip install --disable-pip-version-check "pip-tools==7.5.0"
python -m piptools compile \
  --generate-hashes \
  --resolver=backtracking \
  --output-file "$ROOT_DIR/requirements.txt" \
  "$ROOT_DIR/requirements.in"

echo "Đã khóa dependency và hash tại requirements.txt"

