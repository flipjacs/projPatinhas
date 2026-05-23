/**
 * Middleware multer para uploads de imagem.
 *
 *   • Usa memoryStorage (sem disco intermediário). O Buffer fica em
 *     req.file.buffer e é processado pelo pipeline antes de ir ao storage.
 *   • Filtro inicial REJEITA por MIME declarado — não é confiável, mas
 *     atalha 90% do tráfego ruim antes mesmo de ler bytes.
 *   • A validação canônica (magic bytes + sharp) acontece no service.
 *   • Limite de tamanho vem do env.
 *   • Apenas 1 arquivo, no campo `arquivo`.
 *
 * Erros do multer (LIMIT_FILE_SIZE, LIMIT_UNEXPECTED_FILE, etc.) são
 * traduzidos para AppError padrão via `tratarErroMulter`.
 */
const multer = require('multer');

const env = require('../config/env');
const { ErroValidacao } = require('../errors/AppError');
const { MIMES_PERMITIDOS } = require('../utils/mimeSniff');

const armazenamentoMemoria = multer.memoryStorage();

const upload = multer({
  storage: armazenamentoMemoria,
  limits: {
    fileSize: env.UPLOADS_MAX_BYTES,
    files: 1,
    fields: 8,
  },
  fileFilter(_req, arquivo, cb) {
    // O MIME do header é uma DICA — checagem definitiva é por magic bytes
    // depois. Aqui filtramos o evidente cedo.
    if (!MIMES_PERMITIDOS.includes(arquivo.mimetype)) {
      return cb(new ErroValidacao(
        `Tipo de arquivo não suportado. Aceitos: ${MIMES_PERMITIDOS.join(', ')}`
      ));
    }
    cb(null, true);
  },
});

/**
 * Converte erros do multer em ErroValidacao com mensagens em PT-BR.
 * Express invoca middlewares de erro com 4 args.
 */
function tratarErroMulter(err, _req, _res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const mb = Math.round(env.UPLOADS_MAX_BYTES / 1024 / 1024);
      return next(new ErroValidacao(`Arquivo excede o limite de ${mb} MiB`));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ErroValidacao('Campo de arquivo inesperado'));
    }
    return next(new ErroValidacao(`Falha no upload: ${err.message}`));
  }
  return next(err);
}

// Façade conveniente: garante que o handler vem com seu próprio tratador.
function aceitarArquivo(campo = 'arquivo') {
  return [upload.single(campo), tratarErroMulter];
}

module.exports = { aceitarArquivo };
