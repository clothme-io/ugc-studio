#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "
  const postgres = require('postgres');
  const url = process.env.DATABASE_URL;
  if (!url) { process.exit(1); }
  const sql = postgres(url, { max: 1 });
  sql\`SELECT 1\`.then(() => { sql.end(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
node dist/src/db/migrate.js

echo "Starting API..."
exec "$@"
