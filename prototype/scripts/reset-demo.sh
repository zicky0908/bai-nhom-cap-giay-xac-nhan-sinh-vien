#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

# Reuse the guarded application endpoint. ADMIN_TOKEN is read only inside the
# app container and is never printed. The endpoint deletes demo rows only.
docker compose exec -T app python -c "import json, os, urllib.request; req=urllib.request.Request('http://localhost:8000/api/demo/reset', method='POST', headers={'X-Admin-Token': os.environ['ADMIN_TOKEN']}); print(json.load(urllib.request.urlopen(req, timeout=15)))"
echo "Đã xóa riêng dữ liệu demo trực tiếp; dữ liệu mô phỏng được giữ nguyên."


# Mailpit chỉ chứa email thử nghiệm của demo: dọn để hộp thư sạch trước giờ trình bày.
if curl -fsS -X DELETE "${MAILPIT_URL:-http://localhost:8025}/api/v1/messages" >/dev/null 2>&1; then
  echo "Đã dọn hộp thư thử nghiệm Mailpit."
else
  echo "Không dọn được Mailpit (bỏ qua; kiểm tra http://localhost:8025)."
fi
