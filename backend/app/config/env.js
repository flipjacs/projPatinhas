/**
 * Carrega e valida variáveis de ambiente uma única vez na inicialização.
 * Se algo obrigatório faltar em produção, o processo morre rápido — fail fast.
 */
require('dotenv').config();
const { z } = require('zod');

const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(isProd ? 32 : 16),
  JWT_REFRESH_SECRET: z.string().min(isProd ? 32 : 16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DIAS: z.coerce.number().int().positive().default(30),

  COOKIE_NOME_REFRESH: z.string().default('patinhas_rt'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  // ─── Uploads / Storage ─────────────────────────────────
  // Driver de armazenamento (futuramente: 's3' | 'r2').
  UPLOADS_DRIVER: z.enum(['local']).default('local'),
  // Diretório no disco (relativo ao backend/ ou absoluto).
  UPLOADS_DIR: z.string().default('./uploads'),
  // Prefixo de URL pública servido por express.static.
  UPLOADS_PUBLIC_PATH: z.string().default('/uploads'),
  // Quando definido, monta URLs absolutas (CDN/R2). Vazio = URLs relativas.
  UPLOADS_BASE_URL: z.string().default(''),
  // Limite por arquivo (bytes). Default 5 MiB.
  UPLOADS_MAX_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  const detalhes = resultado.error.issues
    .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
    .join('\n');
  console.error('Variáveis de ambiente inválidas:\n' + detalhes);
  process.exit(1);
}

const env = resultado.data;
env.corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);

module.exports = env;
