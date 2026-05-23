/**
 * Factory de storage. Lê `env.UPLOADS_DRIVER` e devolve uma instância única
 * (singleton) — controllers e services importam daqui sem conhecer o driver.
 *
 * Para adicionar S3/R2:
 *   1. Implemente um S3Driver estendendo StorageDriver.
 *   2. Adicione um case ao switch abaixo.
 *   3. Ajuste `env.js` para aceitar o novo valor em UPLOADS_DRIVER.
 */
const env = require('../config/env');
const LocalDriver = require('./LocalDriver');

let instancia = null;

function obterStorage() {
  if (instancia) return instancia;
  switch (env.UPLOADS_DRIVER) {
    case 'local':
    default:
      instancia = new LocalDriver({
        dir: env.UPLOADS_DIR,
        publicPath: env.UPLOADS_PUBLIC_PATH,
        baseUrl: env.UPLOADS_BASE_URL,
      });
      return instancia;
  }
}

module.exports = { obterStorage };
