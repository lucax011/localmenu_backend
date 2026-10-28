import { execSync } from 'child_process';
import { TEST_DATABASE_URL } from './e2e-env';

// Aplica as migrações no banco de teste (cria o banco se ainda não existir).
// Não apaga nada: cada execução usa e-mails e nomes únicos.
export default function setup() {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'ignore',
  });
}
