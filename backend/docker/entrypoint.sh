#!/bin/sh
set -e

echo "Aplicando migrações..."
npx prisma migrate deploy

echo "Gerando o Prisma Client..."
npx prisma generate

echo "Dados de exemplo (só na primeira vez)..."
npx prisma db seed

if [ "$NODE_ENV" = "development" ]; then
  echo "Iniciando a API em modo watch..."
  exec npm run start:dev
else
  echo "Compilando..."
  npm run build
  echo "Iniciando a API..."
  exec node dist/main.js
fi
