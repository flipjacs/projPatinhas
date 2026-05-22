/**
 * Emissão e verificação de tokens.
 *
 *   • Access token:  JWT assinado com JWT_ACCESS_SECRET, TTL curto (15m).
 *                    Vai no header `Authorization: Bearer <token>`.
 *                    Carrega { sub, papel }.
 *   • Refresh token: string opaca (crypto.randomBytes), TTL longo (30d).
 *                    Armazenamos somente o SHA-256 no banco; o valor cru
 *                    vai em cookie HttpOnly + Secure + SameSite.
 *                    Rotação a cada uso: refresh válido é revogado e um novo
 *                    é emitido — detecção de reuso indica comprometimento.
 */
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function gerarAccessToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, papel: usuario.papel },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL }
  );
}

function verificarAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function gerarRefreshToken() {
  const cru = crypto.randomBytes(48).toString('base64url');
  const hash = crypto.createHash('sha256').update(cru).digest('hex');
  const expiraEm = new Date(Date.now() + env.JWT_REFRESH_TTL_DIAS * 24 * 60 * 60 * 1000);
  return { cru, hash, expiraEm };
}

function hashRefreshToken(cru) {
  return crypto.createHash('sha256').update(cru).digest('hex');
}

function opcoesCookieRefresh() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    maxAge: env.JWT_REFRESH_TTL_DIAS * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}

module.exports = {
  gerarAccessToken,
  verificarAccessToken,
  gerarRefreshToken,
  hashRefreshToken,
  opcoesCookieRefresh,
};
