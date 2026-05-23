/**
 * Serviço de uploads. Orquestra:
 *
 *   1. Sniff de MIME por magic bytes (defesa rápida).
 *   2. Pipeline de processamento via sharp (validação canônica + variantes).
 *   3. Hash SHA-256 do conteúdo original — base do nome do arquivo.
 *   4. Persistência via driver de storage (LocalDriver/S3/R2).
 *   5. Registro em `uploads`.
 *
 * NÃO confiamos em Content-Type nem na extensão original do cliente.
 */
const crypto = require('node:crypto');

const Upload = require('../models/upload');
const { obterStorage } = require('../storage');
const { processarImagem } = require('./imagemPipeline');
const {
  detectarMimeImagem,
  MIMES_PERMITIDOS,
  EXTENSAO_POR_MIME,
} = require('../utils/mimeSniff');
const {
  ErroValidacao,
  ErroNaoEncontrado,
  ErroProibido,
} = require('../errors/AppError');

function podeOperarUpload(requisitante, upload) {
  if (!requisitante) return false;
  if (requisitante.papel === 'admin') return true;
  return Number(requisitante.id) === Number(upload.usuario_id);
}

function sanitizarNome(nome) {
  if (typeof nome !== 'string') return 'arquivo';
  // Remove path traversal e caracteres perigosos. Limita comprimento.
  return nome
    .replace(/[/\\]/g, '_')
    .replace(/[^\w.\-()\s]/g, '')
    .slice(0, 200) || 'arquivo';
}

function montarPasta(dataHora = new Date()) {
  const ano = dataHora.getUTCFullYear();
  const mes = String(dataHora.getUTCMonth() + 1).padStart(2, '0');
  return `${ano}/${mes}`;
}

class UploadService {
  /**
   * Cria um upload a partir do arquivo recebido via multer.
   * @param {object} requisitante  — { id, papel } injetado por exigirAuth.
   * @param {object} arquivo       — req.file: { buffer, originalname, mimetype, size }.
   * @param {object} dados         — { tipo: 'avatar' | 'animal' | 'ong' }.
   */
  async criar(requisitante, arquivo, dados) {
    if (!arquivo || !Buffer.isBuffer(arquivo.buffer) || arquivo.buffer.length === 0) {
      throw new ErroValidacao('Nenhum arquivo recebido');
    }

    // 1) Sniff por magic bytes — fonte autoritativa do MIME.
    const mimeReal = detectarMimeImagem(arquivo.buffer);
    if (!mimeReal || !MIMES_PERMITIDOS.includes(mimeReal)) {
      throw new ErroValidacao(
        `Apenas imagens JPEG, PNG ou WebP são aceitas`
      );
    }

    // 2) Pipeline sharp — re-valida o conteúdo e gera variantes.
    let processado;
    try {
      processado = await processarImagem(arquivo.buffer);
    } catch (e) {
      throw new ErroValidacao(e.message || 'Imagem inválida');
    }

    // 3) Hash do ORIGINAL processado (sem EXIF). Base do nome.
    const hash = crypto
      .createHash('sha256')
      .update(processado.original)
      .digest('hex');

    const pasta = montarPasta();
    const extOriginal = EXTENSAO_POR_MIME[mimeReal];
    const caminhoOriginal = `${pasta}/${hash}-original.${extOriginal}`;
    const caminhoOtimizado = `${pasta}/${hash}-otimizado.webp`;
    const caminhoCard = `${pasta}/${hash}-card.webp`;
    const caminhoThumb = `${pasta}/${hash}-thumb.webp`;

    // 4) Grava cada variante. Local: em disco. Futuro: S3/R2.
    const storage = obterStorage();
    await storage.salvar(caminhoOriginal, processado.original, { mime: mimeReal });
    for (const variante of processado.variantes) {
      const caminho =
        variante.chave === 'otimizado' ? caminhoOtimizado
          : variante.chave === 'card' ? caminhoCard
            : caminhoThumb;
      await storage.salvar(caminho, variante.buffer, { mime: 'image/webp' });
    }

    // 5) Registra no banco.
    const id = await Upload.criar({
      usuario_id: requisitante.id,
      tipo: dados.tipo,
      hash,
      nome_original: sanitizarNome(arquivo.originalname),
      mime: mimeReal,
      tamanho_bytes: processado.original.length,
      largura: processado.largura,
      altura: processado.altura,
      caminho_original: caminhoOriginal,
      caminho_otimizado: caminhoOtimizado,
      caminho_card: caminhoCard,
      caminho_thumb: caminhoThumb,
    });

    return this.buscarPorId(id);
  }

  async buscarPorId(id) {
    const upload = await Upload.buscarPorId(id);
    if (!upload) throw new ErroNaoEncontrado('Upload não encontrado');
    return upload;
  }

  /** Soft-delete + remoção dos arquivos físicos. */
  async remover(id, requisitante) {
    const upload = await this.buscarPorId(id);
    if (!podeOperarUpload(requisitante, upload)) throw new ErroProibido();

    await Upload.softDelete(id);

    const storage = obterStorage();
    // Best-effort — falhas individuais não devem impedir o soft-delete lógico.
    await Promise.allSettled([
      storage.remover(upload.caminho_original),
      storage.remover(upload.caminho_otimizado),
      storage.remover(upload.caminho_card),
      storage.remover(upload.caminho_thumb),
    ]);
  }

  /**
   * Monta a representação pública de um upload, com URLs prontas para
   * o frontend consumir. Usa o driver para resolver caminhos.
   */
  representar(upload) {
    if (!upload) return null;
    const storage = obterStorage();
    return {
      id: upload.id,
      usuario_id: upload.usuario_id,
      tipo: upload.tipo,
      hash: upload.hash,
      nome_original: upload.nome_original,
      mime: upload.mime,
      tamanho_bytes: upload.tamanho_bytes,
      largura: upload.largura,
      altura: upload.altura,
      criado_em: upload.criado_em,
      urls: {
        original: storage.urlPublica(upload.caminho_original),
        otimizado: storage.urlPublica(upload.caminho_otimizado),
        card: storage.urlPublica(upload.caminho_card),
        thumb: storage.urlPublica(upload.caminho_thumb),
      },
    };
  }
}

module.exports = new UploadService();
// expor utilitários para scripts/teste
module.exports.sanitizarNome = sanitizarNome;
module.exports.montarPasta = montarPasta;
