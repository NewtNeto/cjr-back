import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Configuração da CLI do Prisma (migrations, generate, studio).
export default defineConfig({
  // Pasta com os arquivos .prisma divididos por assunto.
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // A URL vem do arquivo .env (veja .env.example).
    url: env('DATABASE_URL'),
  },
});
