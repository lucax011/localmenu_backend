#!/bin/bash
set -e

echo "Running database migrations (deploy)..."
npx prisma migrate deploy

echo "Ensuring Prisma Client is generated..."
npx prisma generate --skip-download || true

echo "Starting application..."
exec node dist/main.js