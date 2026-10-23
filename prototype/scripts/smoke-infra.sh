#!/usr/bin/env sh
set -eu

APP_URL=${APP_URL:-http://localhost:8000}
N8N_URL=${N8N_URL:-http://localhost:5678}
MAILPIT_URL=${MAILPIT_URL:-http://localhost:8025}

check() {
  name=$1
  url=$2
  if ! curl --fail --silent --show-error --max-time 10 "$url" >/dev/null; then
    echo "FAIL: $name không sẵn sàng tại $url" >&2
    exit 1
  fi
  echo "OK: $name"
}

check "Ứng dụng" "$APP_URL/api/health"
check "n8n" "$N8N_URL/healthz"
check "Mailpit" "$MAILPIT_URL/api/v1/info"

echo "Hạ tầng sẵn sàng. Chạy kiểm thử E2E ứng dụng để xác minh các nhánh nghiệp vụ."

