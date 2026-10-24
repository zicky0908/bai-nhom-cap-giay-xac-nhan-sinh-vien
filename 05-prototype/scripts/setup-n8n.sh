#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

docker compose up -d postgres mailpit n8n

attempt=0
until docker compose exec -T n8n wget --spider -q http://localhost:5678/healthz; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    echo "n8n không sẵn sàng sau 5 phút" >&2
    exit 1
  fi
  sleep 5
done

# Both files contain only local Mailpit metadata and environment expressions.
# No API token or Internet SMTP credential is committed.
docker compose exec -T n8n n8n import:credentials \
  --input=/bootstrap/credentials/mailpit.smtp.credentials.json
docker compose exec -T n8n n8n import:workflow \
  --input=/bootstrap/workflows/student-certificate.json
docker compose exec -T n8n n8n publish:workflow \
  --id=student-certificate-v1

# Reload active webhooks after the CLI changes the workflow database record.
docker compose restart n8n
echo "Workflow đã import và bật. Editor: http://localhost:5678"

