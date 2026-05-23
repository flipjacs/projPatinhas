/**
 * Driver de armazenamento local (disco).
 *
 * Mapeia "caminho relativo" → `<UPLOADS_DIR>/<caminho>` no disco e gera
 * URLs sob `<UPLOADS_PUBLIC_PATH>/<caminho>` (relativas, a menos que
 * UPLOADS_BASE_URL seja preenchido — útil para CDN/R2).
 *
 * Segurança:
 *   • `resolverCaminhoAbsoluto` normaliza o path e VERIFICA que ele
 *     permanece dentro do diretório raiz — impede path traversal mesmo
 *     que algum caller passe ".." indevidamente.
 *   • Os diretórios são criados com {recursive: true} mas só sob a raiz.
 */
const fs = require('node:fs/promises');
const path = require('node:path');

const StorageDriver = require('./StorageDriver');

class LocalDriver extends StorageDriver {
  /**
   * @param {object} cfg
   * @param {string} cfg.dir             — raiz física (absoluto OU relativo ao cwd).
   * @param {string} cfg.publicPath      — prefixo de URL (ex: "/uploads").
   * @param {string} cfg.baseUrl         — quando preenchido, URLs ficam absolutas.
   */
  constructor({ dir, publicPath, baseUrl = '' }) {
    super();
    this.raizAbsoluta = path.resolve(dir);
    this.publicPath = publicPath.replace(/\/$/, '');
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /** Resolve caminho relativo e blinda contra path traversal. */
  resolverCaminhoAbsoluto(caminhoRelativo) {
    if (typeof caminhoRelativo !== 'string' || !caminhoRelativo) {
      throw new Error('caminho relativo inválido');
    }
    // Normaliza separadores e remove qualquer "../" residual.
    const limpo = caminhoRelativo.replace(/\\/g, '/').replace(/^\/+/, '');
    const absoluto = path.resolve(this.raizAbsoluta, limpo);
    const dentro = absoluto === this.raizAbsoluta
      || absoluto.startsWith(this.raizAbsoluta + path.sep);
    if (!dentro) {
      throw new Error('Caminho de upload fora da raiz permitida');
    }
    return absoluto;
  }

  async salvar(caminhoRelativo, buffer) {
    const absoluto = this.resolverCaminhoAbsoluto(caminhoRelativo);
    await fs.mkdir(path.dirname(absoluto), { recursive: true });
    // Grava com `wx` quando possível para detectar colisão; aqui usamos write
    // padrão porque os nomes são content-hashed (sobrescrita é semanticamente
    // idempotente).
    await fs.writeFile(absoluto, buffer);
  }

  async remover(caminhoRelativo) {
    if (!caminhoRelativo) return;
    const absoluto = this.resolverCaminhoAbsoluto(caminhoRelativo);
    try {
      await fs.unlink(absoluto);
    } catch (erro) {
      if (erro.code !== 'ENOENT') throw erro;
    }
  }

  urlPublica(caminhoRelativo) {
    if (!caminhoRelativo) return null;
    const limpo = caminhoRelativo.replace(/\\/g, '/').replace(/^\/+/, '');
    const rel = `${this.publicPath}/${limpo}`;
    return this.baseUrl ? this.baseUrl + rel : rel;
  }

  /** Caminho físico absoluto da raiz — usado pelo express.static. */
  raizDisco() {
    return this.raizAbsoluta;
  }
}

module.exports = LocalDriver;
