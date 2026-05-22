/**
 * Middleware de autenticação e autorização.
 *
 *   • exigirAuth        — exige Bearer token válido; popula req.usuario = { id, papel }.
 *   • exigirPapel(...)  — restringe a determinados papéis (ex: 'ong', 'admin').
 *   • opcionalAuth      — popula req.usuario se houver token, mas não falha sem ele.
 */
const { ErroNaoAutorizado, ErroProibido } = require('../errors/AppError');
const { verificarAccessToken } = require('../utils/tokens');

function extrairToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

function exigirAuth(req, _res, next) {
  const token = extrairToken(req);
  if (!token) return next(new ErroNaoAutorizado());
  try {
    const payload = verificarAccessToken(token);
    req.usuario = { id: payload.sub, papel: payload.papel };
    return next();
  } catch {
    return next(new ErroNaoAutorizado('Token inválido ou expirado'));
  }
}

function opcionalAuth(req, _res, next) {
  const token = extrairToken(req);
  if (!token) return next();
  try {
    const payload = verificarAccessToken(token);
    req.usuario = { id: payload.sub, papel: payload.papel };
  } catch {
    /* silencioso — token ruim trata-se como anônimo */
  }
  return next();
}

function exigirPapel(...papeisPermitidos) {
  return (req, _res, next) => {
    if (!req.usuario) return next(new ErroNaoAutorizado());
    if (!papeisPermitidos.includes(req.usuario.papel)) {
      return next(new ErroProibido());
    }
    return next();
  };
}

module.exports = { exigirAuth, opcionalAuth, exigirPapel };
