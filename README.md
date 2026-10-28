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

## Módulos e rotas

| Módulo | Rotas principais |
| --- | --- |
| `auth` | `POST /auth/register` (só CUSTOMER ou OWNER), `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`; `GET /auth/profile` |
| `users` | `GET /users/me`, `PATCH /users/me` |
| `public` | sem login: `GET /public/restaurants`, `GET /public/r/:slug` (restaurante, horários e cardápio) |
| `restaurants` | `GET /restaurants/me`, `GET`/`PATCH /restaurants/:id`, horários em `/restaurants/:restaurantId/hours`, `GET /restaurants/:id/report?days=7` |
| `menus` | só o dono: `GET`/`POST /menus/:restaurantId`, categorias (`/menus/category/...`), itens (`/menus/item/...`) e `POST /menus/:menuId/import` (itens revisados do OCR) |
| `uploads` | `POST /uploads/ocr` (foto JPEG/PNG até 10 MB; devolve os itens lidos para revisão) |
| `orders` | `POST /orders`, `GET /orders/me`, `GET /orders/:id`, `GET /orders/restaurant/:restaurantId`, `PATCH /orders/:id/status` |
| `payments` | pagamento **simulado**: `POST /payments` marca o pedido como pago e confirmado; `GET /payments/:orderId` |

Regras importantes: preços dos pedidos vêm sempre do banco, o dono só mexe no próprio
restaurante, itens com pedidos não podem ser apagados (409), e o status do pedido só
avança pelas transições válidas.

Modelos no Prisma: `User`, `CustomerProfile`, `CustomerAddress`, `Restaurant`, `RestaurantHours`, `Menu`, `MenuCategory`, `MenuItem`, `MenuUpload`, `AIProcessingJob`, `Order`, `OrderItem`, `Payment`, `Notification` e `PasswordResetToken`.

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
