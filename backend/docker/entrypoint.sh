#!/bin/sh
set -e

echo "Running database migrations (deploy)..."
npx prisma migrate deploy

echo "Generating Prisma Client (skip download if already cached)..."
npx prisma generate --skip-download || true

if [ "$NODE_ENV" = "development" ]; then
  echo "Starting Nest in watch mode..."
  exec npm run start:dev
else
  echo "Building application..."
  npm run build
  echo "Starting application (prod)..."
  exec node dist/main.js
fi