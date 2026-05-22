/**
 * Executor simples de migrações .sql.
 * Roda na ordem alfabética todos os arquivos em db/migrations.
 * Cada arquivo pode conter múltiplos statements (separados por ";").
 *
 * Uso: npm run db:migrate
 */
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const env = require('../app/config/env');

async function executar() {
  const dir = path.join(__dirname, 'migrations');
  const arquivos = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const conexao = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
  });

  try {
    for (const nome of arquivos) {
      const sql = fs.readFileSync(path.join(dir, nome), 'utf8');
      process.stdout.write(`→ ${nome} ... `);
      await conexao.query(sql);
      process.stdout.write('OK\n');
    }
    console.log('\nMigrações aplicadas com sucesso.');
  } finally {
    await conexao.end();
  }
}

executar().catch((erro) => {
  console.error('Falha ao aplicar migrações:', erro.message);
  process.exit(1);
});
