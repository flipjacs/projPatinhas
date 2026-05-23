/**
 * Pipeline de processamento de imagem (sharp).
 *
 *   • Valida que o buffer é uma imagem real (sharp.metadata lê o cabeçalho
 *     e lança em arquivos malformados).
 *   • Strip de EXIF/metadata por padrão (privacidade + tamanho).
 *   • Aplica `.rotate()` para respeitar a orientação EXIF antes de descartar.
 *   • Gera variantes WebP em larguras alvo (original mantém formato bruto):
 *       - otimizado: 1280px (página de detalhe)
 *       - card:      600px  (grids)
 *       - thumb:     200px  (dashboards/listagens densas)
 *
 * O caller decide onde gravar (storage driver) — esta camada só transforma.
 */
const sharp = require('sharp');

// Variantes geradas para todas as imagens. Mantidas em ordem decrescente de
// tamanho para o frontend conseguir compor srcset de forma natural. Effort
// 4 mantém compressão decente sem custo de CPU absurdo (vs. default 4 vs. 6).
const VARIANTES = [
  { chave: 'otimizado', largura: 1280, qualidade: 82 },
  { chave: 'card', largura: 600, qualidade: 78 },
  { chave: 'thumb', largura: 200, qualidade: 72 },
];

// Defesas anti-bomb / anti-DoS na entrada do pipeline:
//   • 25 MP cobre 5K (e mais) sem dar margem a payloads que esgotam RAM.
//   • imagens <50px de lado tipicamente são ruído ou ataque de header forjado.
//   • razão de aspecto extrema indica imagem deformada/maliciosa.
const PIXELS_MAX = 25_000_000;
const DIMENSAO_MIN = 50;
const RAZAO_MAX = 20;

/**
 * @param {Buffer} bufferOriginal
 * @returns {Promise<{
 *   largura: number, altura: number, formato: string,
 *   original: Buffer,
 *   variantes: { chave: string, buffer: Buffer, largura: number }[]
 * }>}
 */
async function processarImagem(bufferOriginal) {
  const opcoesSharp = { limitInputPixels: PIXELS_MAX, sequentialRead: true };
  const base = sharp(bufferOriginal, opcoesSharp).rotate();
  const meta = await base.metadata();

  if (!meta || !meta.format || !['jpeg', 'png', 'webp'].includes(meta.format)) {
    const erro = new Error('Formato de imagem não suportado');
    erro.codigo = 'FORMATO_NAO_SUPORTADO';
    throw erro;
  }
  if (!meta.width || !meta.height) {
    const erro = new Error('Imagem sem dimensões válidas');
    erro.codigo = 'IMAGEM_INVALIDA';
    throw erro;
  }
  if (meta.width < DIMENSAO_MIN || meta.height < DIMENSAO_MIN) {
    const erro = new Error('Imagem muito pequena (mínimo 50×50)');
    erro.codigo = 'IMAGEM_PEQUENA';
    throw erro;
  }
  const razao = meta.width / meta.height;
  if (razao > RAZAO_MAX || razao < 1 / RAZAO_MAX) {
    const erro = new Error('Proporção de imagem inválida');
    erro.codigo = 'PROPORCAO_INVALIDA';
    throw erro;
  }

  // Original "limpa": rotacionada + sem EXIF. Reusamos a mesma instância
  // (já carregada) — economiza um decode comparado a refazer sharp(buffer).
  const original = await base.clone().toBuffer();

  // Variantes em paralelo. Cada uma re-inicia o pipeline para evitar
  // efeitos colaterais entre clones e permitir resize independente.
  const variantes = await Promise.all(
    VARIANTES.map(async ({ chave, largura, qualidade }) => {
      const buffer = await sharp(bufferOriginal, opcoesSharp)
        .rotate()
        .resize({ width: largura, withoutEnlargement: true })
        .webp({ quality: qualidade, effort: 4 })
        .toBuffer();
      return { chave, buffer, largura };
    })
  );

  return {
    largura: meta.width,
    altura: meta.height,
    formato: meta.format,
    original,
    variantes,
  };
}

module.exports = { processarImagem, VARIANTES, PIXELS_MAX };
