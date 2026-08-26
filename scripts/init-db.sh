#!/usr/bin/env bash
set -euo pipefail

docker compose exec -T postgres psql -U preflight -d preflight -f - < apps/api/src/indexer/schema.sql