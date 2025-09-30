#!/bin/sh

# Backend startup script with database initialization
# This script ensures the database is properly initialized before starting the application

set -e

echo "[INFO] Starting backend application..."

# Wait for database to be available
echo "[INFO] Waiting for database connection..."
until npx prisma db push --accept-data-loss 2>/dev/null; do
  echo "[INFO] Database not ready, waiting 5 seconds..."
  sleep 5
done

echo "[INFO] Database is ready and schema is up to date"

# Generate Prisma client (in case it's not available)
echo "[INFO] Generating Prisma client..."
npx prisma generate

echo "[INFO] Starting NestJS application..."
# Start the application
exec node dist/main