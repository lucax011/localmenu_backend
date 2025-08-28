# 🍽️ LocaMenu - Backend API

Sistema de gestão de cardápios digitais com IA para restaurantes e clientes.

## 📋 Visão Geral

O LocaMenu Backend é uma API REST desenvolvida em NestJS que serve duas aplicações móveis:
- **App B2C**: Clientes navegam restaurantes e fazem pedidos
- **App B2B**: Restaurantes gerenciam cardápios e pedidos

### 🏗️ Arquitetura
<img width="760" height="512" alt="arquitetura" src="https://github.com/user-attachments/assets/55b105bc-413d-41c8-9f3b-fa836333b212" />

## 🚀 Tecnologias

- **Framework**: NestJS + TypeScript
- **Banco**: PostgreSQL (Aurora) + Prisma ORM
- **Autenticação**: JWT + Refresh Tokens
- **Upload**: AWS S3
- **IA**: Microserviço Python (OCR + NLP)
- **Cache**: Redis (futuro)
- **Logs**: Winston + CloudWatch
- **Containerização**: Docker

## 📦 Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd locamenu-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações do banco
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run start:dev
🗄️ Estrutura do Projeto
src/
├── auth/           # Autenticação JWT
├── users/          # Gestão de usuários
├── restaurants/    # CRUD restaurantes
├── menus/          # Gestão de cardápios
├── menu-items/     # Itens do cardápio
├── orders/         # Sistema de pedidos
├── payments/       # Integração pagamentos
├── ai/             # Integração com IA
├── uploads/        # Upload de arquivos
├── common/         # Middlewares, guards, etc.
└── prisma/         # Schema e migrações
🔐 Variáveis de Ambiente

DATABASE_URL="postgresql://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
AI_SERVICE_URL="http://localhost:8000"
📚 Scripts Disponíveis

npm run start:dev    # Desenvolvimento
npm run build        # Build produção
npm run test         # Testes unitários
npm run test:e2e     # Testes e2e
npm run lint         # ESLint
npm run prisma:studio # Interface visual do banco
