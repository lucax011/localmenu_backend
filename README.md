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

## Como rodar (desenvolvimento local)

O `docker compose` sobe o Postgres, o serviço de OCR e a API. Ele espera o repositório
`localmenu_OCRservice` clonado ao lado deste (ou o caminho em `OCR_SERVICE_PATH`):

```
LocalMenu/
├── localmenu_backend/      (este)
└── localmenu_OCRservice/
```

```bash
cd backend
cp .env.example .env      # preencha JWT_SECRET e JWT_REFRESH_SECRET com valores aleatórios
docker compose up --build
```

| Serviço | Endereço |
| --- | --- |
| API | http://localhost:3000 (Swagger em `/docs`) |
| OCR | http://localhost:8000 |
| Postgres | localhost:5433 |

Todas as portas ficam presas em `127.0.0.1`. Ao subir, o container aplica as migrações
(`prisma migrate deploy`) e roda o seed, que cria dados de exemplo só na primeira vez.

### Contas de exemplo

Senha `localmenu123` para todas (só valem no banco local):

| Conta | Papel |
| --- | --- |
| `dono@localmenu.dev` | dono da Brasa Burger (com 6 pedidos de exemplo) |
| `nonna@localmenu.dev` | dona da Cantina da Nonna |
| `kaze@localmenu.dev` | dono do Sushi Kaze |
| `cliente@localmenu.dev` | cliente |

### Subir tudo: API, OCR e os dois apps

Os quatro repositórios clonados lado a lado:

```bash
mkdir LocalMenu && cd LocalMenu
git clone https://github.com/lucax011/localmenu_backend
git clone https://github.com/lucax011/localmenu_OCRservice
git clone https://github.com/lucax011/localmenu_frontendB2B
git clone https://github.com/lucax011/localmenu_frontendB2C

# 1. Banco, OCR e API
cd localmenu_backend/backend
cp .env.example .env          # preencha JWT_SECRET e JWT_REFRESH_SECRET
docker compose up --build -d

# 2. App do restaurante: http://localhost:8081
cd ../../localmenu_frontendB2B
npm install && npm run web

# 3. App do cliente: http://localhost:8082 (outro terminal)
cd ../localmenu_frontendB2C
npm install && npm run web
```

Os apps também ficam presos a `127.0.0.1`. Faça um pedido no app do cliente (`cliente@localmenu.dev`)
e acompanhe no painel do restaurante (`dono@localmenu.dev`).

## Módulos e rotas

| Módulo | Rotas principais |
| --- | --- |
| `auth` | `POST /auth/register` (só CUSTOMER ou OWNER), `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/profile` |
| `users` | `GET /users/me`, `PATCH /users/me` |
| `public` | sem login: `GET /public/restaurants`, `GET /public/r/:slug` (restaurante, horários e cardápio) |
| `restaurants` | `GET /restaurants/me`, `GET`/`PATCH /restaurants/:id`, horários em `/restaurants/:restaurantId/hours`, `GET /restaurants/:id/report?days=7` |
| `menus` | só o dono: `GET`/`POST /menus/:restaurantId`, categorias (`/menus/category/...`), itens (`/menus/item/...`) e `POST /menus/:menuId/import` (itens revisados do OCR) |
| `uploads` | `POST /uploads/ocr` (foto JPEG/PNG até 10 MB; devolve os itens lidos para revisão), `POST /uploads/image` (foto de prato, logo ou capa, até 5 MB; devolve a URL) |
| `orders` | `POST /orders`, `GET /orders/me`, `GET /orders/:id`, `GET /orders/restaurant/:restaurantId`, `PATCH /orders/:id/status` |
| `payments` | pagamento **simulado**: `POST /payments` marca o pedido como pago e confirmado; `GET /payments/:orderId` |

Regras importantes: preços dos pedidos vêm sempre do banco, o dono só mexe no próprio
restaurante, itens com pedidos não podem ser apagados (409), e o status do pedido só
avança pelas transições válidas.

Fotos: `MenuItem.imageUrl`, `Restaurant.logoUrl` e `Restaurant.coverUrl` aceitam só `https://…` ou um arquivo enviado por `/uploads/image`. O seed põe fotos de exemplo (Unsplash) e deixa alguns itens sem foto de propósito.

Modelos no Prisma: `User`, `CustomerProfile`, `CustomerAddress`, `Restaurant`, `RestaurantHours`, `Menu`, `MenuCategory`, `MenuItem`, `MenuUpload`, `AIProcessingJob`, `Order`, `OrderItem`, `Payment`, `Notification` e `PasswordResetToken`.

## Segurança

- Senhas com bcrypt; refresh token guardado só como hash.
- Rotas de autenticação limitadas a 10 tentativas por minuto por IP (`AUTH_RATE_LIMIT`); depois respondem 429.
- Cabeçalhos do `helmet` (`nosniff`, sem `X-Powered-By`).
- CORS fechado nas origens de `CORS_ORIGINS` (os apps em 8081 e 8082).
- Uploads: só JPEG ou PNG, até 10 MB, salvos com nome aleatório.
- `JWT_SECRET` e `JWT_REFRESH_SECRET` não têm valor padrão: sem eles a API não sobe.

## Scripts

```bash
npm run start:dev   # desenvolvimento com watch
npm run build       # build de produção
npm run test        # testes unitários
npm run test:e2e    # testes e2e (jornadas do dono e do cliente)
npm run lint        # ESLint
```

Os testes e2e usam o banco `localmenu_test` no Postgres do compose (porta 5433).
Eles só aplicam migrações, nunca apagam o banco, e cada execução cria dados com
nomes únicos, então podem rodar várias vezes. O OCR é simulado nos testes.
