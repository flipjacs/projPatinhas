/**
 * Detecção de MIME a partir dos primeiros bytes do arquivo (magic numbers).
 *
 * NUNCA confie no header Content-Type ou na extensão — ambos vêm do cliente
 * e são facilmente forjáveis. Aceitamos apenas imagens JPEG, PNG e WebP;
 * qualquer outra coisa devolve null, e o caller deve rejeitar.
 *
 * Esta função é uma DEFESA RÁPIDA. A validação canônica adicional é feita
 * por `sharp.metadata()`, que falha em arquivos malformados.
 */

/**
 * @param {Buffer} buf
 * @returns {'image/jpeg'|'image/png'|'image/webp'|null}
 */
function detectarMimeImagem(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
    && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

const MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

const EXTENSAO_POR_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

module.exports = { detectarMimeImagem, MIMES_PERMITIDOS, EXTENSAO_POR_MIME };
