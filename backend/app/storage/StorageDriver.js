/**
 * Interface mínima que todo driver de storage deve cumprir.
 *
 * Serviços e controllers SÓ falam com esta abstração — nunca com `fs`
 * diretamente. Isso permite trocar para S3/R2/MinIO no futuro alterando
 * apenas uma factory.
 *
 * O contrato lida com "caminhos relativos" do tipo:
 *   "2026/05/abc...def-original.webp"
 * Cada driver decide como mapear esse caminho relativo para um local físico
 * (diretório local, chave em bucket, etc.).
 */
class StorageDriver {
  /**
   * Grava um Buffer no caminho relativo.
   * @param {string} caminhoRelativo
   * @param {Buffer} buffer
   * @param {{ mime: string }} meta
   * @returns {Promise<void>}
   */
  async salvar(/* caminhoRelativo, buffer, meta */) {
    throw new Error('StorageDriver.salvar() não implementado');
  }

  /**
   * Remove o arquivo. Não deve lançar se o arquivo não existir.
   * @param {string} caminhoRelativo
   */
  async remover(/* caminhoRelativo */) {
    throw new Error('StorageDriver.remover() não implementado');
  }

  /**
   * Converte caminho relativo em URL pública (relativa ou absoluta).
   * @param {string} caminhoRelativo
   * @returns {string}
   */
  urlPublica(/* caminhoRelativo */) {
    throw new Error('StorageDriver.urlPublica() não implementado');
  }
}

module.exports = StorageDriver;
