/**
 * Manipulador central de erros.
 *
 * • Subclasses de AppError: traduz para JSON com codigo/mensagem/detalhes.
 * • Erros do MySQL/duplicate-key: convertidos para 409 CONFLITO de forma
 *   genérica e segura (não vaza nome de constraint).
 * • Erros do Express body-parser (JSON inválido): 400 VALIDACAO.
 * • Qualquer outra coisa: 500 INTERNO, mensagem genérica em produção.
 */
const env = require('../config/env');
const { AppError } = require('../errors/AppError');

function naoEncontradoHandler(_req, res) {
  return res.status(404).json({
    erro: { codigo: 'NAO_ENCONTRADO', mensagem: 'Rota não encontrada' },
  });
}

function errorHandler(err, req, res, _next) {
  if (req.log?.error) req.log.error({ err }, 'Erro tratado');

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      erro: {
        codigo: err.codigo,
        mensagem: err.message,
        ...(err.detalhes !== undefined ? { detalhes: err.detalhes } : {}),
      },
    });
  }

  // Body-parser do Express
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      erro: { codigo: 'VALIDACAO', mensagem: 'JSON inválido no corpo da requisição' },
    });
  }

  // MySQL duplicate key
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      erro: { codigo: 'CONFLITO', mensagem: 'Registro duplicado' },
    });
  }

  return res.status(500).json({
    erro: {
      codigo: 'INTERNO',
      mensagem:
        env.NODE_ENV === 'production'
          ? 'Erro interno do servidor'
          : (err && err.message) || 'Erro interno do servidor',
    },
  });
}

module.exports = { errorHandler, naoEncontradoHandler };
