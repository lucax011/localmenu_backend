# LocalMenu: Backend API

API do **LocalMenu**, uma plataforma de cardápios digitais com IA para restaurantes e clientes. Ela atende dois apps móveis:

- **App B2C:** clientes navegam pelos restaurantes e fazem pedidos
- **App B2B:** restaurantes gerenciam cardápios e pedidos, inclusive importando o cardápio por foto (OCR)

## Ecossistema LocalMenu

| Repositório | Papel |
| --- | --- |
| **localmenu_backend** (este) | API NestJS + PostgreSQL |
| [localmenu_frontendB2C](https://github.com/lucax011/localmenu_frontendB2C) | App do cliente (Expo) |
| [localmenu_frontendB2B](https://github.com/lucax011/localmenu_frontendB2B) | App do restaurante (Expo) |
| [localmenu_OCRservice](https://github.com/lucax011/localmenu_OCRservice) | Microsserviço de OCR em Python (FastAPI) |

## Arquitetura

<img width="760" height="512" alt="arquitetura" src="https://github.com/user-attachments/assets/55b105bc-413d-41c8-9f3b-fa836333b212" />

## Stack

- NestJS 11 + TypeScript
- PostgreSQL 16 + Prisma ORM
- Autenticação JWT com refresh token e recuperação de senha
- Upload de arquivos com Multer; extração de cardápio pelo serviço de OCR
- Docker e Docker Compose

## Como rodar

Com Docker (sobe a API e o Postgres, e roda as migrações):

```bash
cd backend
cp .env.example .env      # preencha JWT_SECRET e JWT_REFRESH_SECRET
docker compose up --build # API em http://localhost:3000
```

Sem Docker (Postgres local, com `localhost` no `DATABASE_URL`):

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

## Módulos e rotas

| Módulo | Rotas principais |
| --- | --- |
| `auth` | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/profile` |
| `users` | `GET /users/:id`, `PATCH /users/:id` |
| `restaurants` | `GET /restaurants/me`, `GET`/`PATCH /restaurants/:id`, horários em `/restaurants/:restaurantId/hours` |
| `menus` | cardápios, categorias e itens em `/menus` |
| `orders` | `GET /orders/me`, `GET /orders/restaurant/:restaurantId`, `PATCH /orders/:id/status` |
| `payments` | `GET /payments/:orderId`, `POST /payments/webhook/success` |
| `uploads` | `POST /uploads/ocr` (envia a foto do cardápio ao OCR) |
| `ai` | `POST /ai/extract-from-url` |

Modelos no Prisma: `User`, `CustomerProfile`, `CustomerAddress`, `Restaurant`, `RestaurantHours`, `Menu`, `MenuCategory`, `MenuItem`, `MenuUpload`, `AIProcessingJob`, `Order`, `OrderItem`, `Payment`, `Notification` e `PasswordResetToken`.

## Scripts

```bash
npm run start:dev   # desenvolvimento com watch
npm run build       # build de produção
npm run test        # testes unitários
npm run test:e2e    # testes e2e
npm run lint        # ESLint
```
