#!/usr/bin/env bash
# SpaceRunner nightly database backup.
# - Reads credentials from customers/spacerunner/.env at runtime (never hardcoded)
# - Daily dumps: 7-day rotation
# - Sunday dumps additionally archived: 8-week retention (~2 months)
# - Cron: 0 3 * * * /home/ubuntu/websters/customers/spacerunner/backups/backup.sh >> /var/log/spacerunner-backup.log 2>&1
set -euo pipefail

APP_DIR="/home/ubuntu/websters/customers/spacerunner"
BACKUP_DIR="$APP_DIR/backups/daily"
WEEKLY_DIR="$APP_DIR/backups/weekly"
CONTAINER="spacerunner-db"

mkdir -p "$BACKUP_DIR" "$WEEKLY_DIR"
chmod 700 "$APP_DIR/backups"

# shellcheck disable=SC1090
DB_NAME=$(grep '^DB_NAME=' "$APP_DIR/.env" | cut -d= -f2)
DB_USER=$(grep '^DB_USER=' "$APP_DIR/.env" | cut -d= -f2)
DB_PASSWORD=$(grep '^DB_PASSWORD=' "$APP_DIR/.env" | cut -d= -f2-)

STAMP=$(date +%F)          # YYYY-MM-DD
DOW=$(date +%u)            # 1=Mon .. 7=Sun
OUT="$BACKUP_DIR/spacerunner-$STAMP.sql.gz"

docker exec "$CONTAINER" mariadb-dump \
  -u"$DB_USER" -p"$DB_PASSWORD" \
  --single-transaction --routines --events \
  "$DB_NAME" | gzip > "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
chmod 600 "$OUT"

# Sunday copy kept 8 weeks
if [ "$DOW" = "7" ]; then
  cp -p "$OUT" "$WEEKLY_DIR/spacerunner-$STAMP.sql.gz"
fi

# Rotation: dailies older than 7 days, weeklies older than 56 days
find "$BACKUP_DIR" -name 'spacerunner-*.sql.gz' -mtime +7 -delete
find "$WEEKLY_DIR" -name 'spacerunner-*.sql.gz' -mtime +56 -delete

echo "[$(date -Is)] backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
