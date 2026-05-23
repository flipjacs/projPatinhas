/**
 * Executor de migrações .sql com ledger de aplicação.
 *
 *   • Cria `schema_migrations` (se não existir) na primeira execução.
 *   • Aplica somente migrações ainda não registradas no ledger.
 *   • Cada migração roda em transação — se algum statement falhar,
 *     o arquivo inteiro reverte e o ledger fica intacto.
 *
 * Uso: npm run db:migrate
 */
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

const env = require('../app/config/env');

const SQL_LEDGER = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  nome VARCHAR(120) NOT NULL PRIMARY KEY,
  aplicado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

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
    await conexao.query(SQL_LEDGER);
    const [aplicadas] = await conexao.query('SELECT nome FROM schema_migrations');
    const jaAplicadas = new Set(aplicadas.map((r) => r.nome));

    let executadas = 0;
    for (const nome of arquivos) {
      if (jaAplicadas.has(nome)) {
        process.stdout.write(`= ${nome} (já aplicada)\n`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, nome), 'utf8');
      process.stdout.write(`→ ${nome} ... `);
      await conexao.beginTransaction();
      try {
        await conexao.query(sql);
        await conexao.query(
          'INSERT INTO schema_migrations (nome) VALUES (?)',
          [nome]
        );
        await conexao.commit();
        process.stdout.write('OK\n');
        executadas++;
      } catch (erro) {
        await conexao.rollback();
        throw erro;
      }
    }
    console.log(
      executadas === 0
        ? '\nNenhuma migração nova para aplicar.'
        : `\n${executadas} migração(ões) aplicada(s) com sucesso.`
    );
  } finally {
    await conexao.end();
  }
}

executar().catch((erro) => {
  // Alguns erros do mysql2 deixam `message` vazia e colocam a info real em
  // `sqlMessage` / `code` / `errno`. Imprimimos tudo para facilitar o debug.
  console.error('Falha ao aplicar migrações:');
  console.error('  message   :', erro.message || '(vazio)');
  if (erro.code)       console.error('  code      :', erro.code);
  if (erro.errno)      console.error('  errno     :', erro.errno);
  if (erro.sqlState)   console.error('  sqlState  :', erro.sqlState);
  if (erro.sqlMessage) console.error('  sqlMessage:', erro.sqlMessage);
  if (erro.sql)        console.error('  sql       :', String(erro.sql).slice(0, 400));
  if (!erro.code) console.error(erro);
  process.exit(1);
});
