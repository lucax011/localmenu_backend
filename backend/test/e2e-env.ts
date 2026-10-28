// Os testes e2e usam um banco só deles (localmenu_test), separado dos dados de exemplo.
// Por padrão é o Postgres do docker compose (porta 5433 de localhost).
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/localmenu_test?schema=public';

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'segredo-so-para-testes';
process.env.JWT_REFRESH_SECRET = 'outro-segredo-so-para-testes';
// os testes fazem muitos logins seguidos
process.env.AUTH_RATE_LIMIT = '1000';
