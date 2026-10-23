#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SEED=${1:-43044}
CASES=${2:-120}

cd "$ROOT_DIR"
docker compose exec -T \
  -e SEED_VALUE="$SEED" \
  -e CASE_COUNT="$CASES" \
  app python -c "import os; from app.database import SessionLocal; from app.seed import seed_simulated; db=SessionLocal(); print(seed_simulated(db, seed=int(os.environ['SEED_VALUE']), cases=int(os.environ['CASE_COUNT']))); db.close()"

echo "Đã tạo dữ liệu mô phỏng có thể tái lập (seed=$SEED, cases mỗi kịch bản=$CASES)."

