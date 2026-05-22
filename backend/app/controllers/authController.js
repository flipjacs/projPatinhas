const authService = require('../services/authService');
const { ok, criado } = require('../utils/responder');
const { opcoesCookieRefresh } = require('../utils/tokens');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

function contextoDaRequisicao(req) {
  return {
    user_agent: req.get('user-agent') || null,
    ip: req.ip || null,
  };
}

function setarCookieRefresh(res, refreshTokenCru) {
  res.cookie(env.COOKIE_NOME_REFRESH, refreshTokenCru, opcoesCookieRefresh());
}

function limparCookieRefresh(res) {
  res.clearCookie(env.COOKIE_NOME_REFRESH, { ...opcoesCookieRefresh(), maxAge: 0 });
}

exports.registrar = asyncHandler(async (req, res) => {
  const { usuario, accessToken, refreshTokenCru } = await authService.registrar(
    req.body,
    contextoDaRequisicao(req)
  );
  setarCookieRefresh(res, refreshTokenCru);
  return criado(res, { usuario, accessToken });
});

exports.login = asyncHandler(async (req, res) => {
  const { usuario, accessToken, refreshTokenCru } = await authService.login(
    req.body,
    contextoDaRequisicao(req)
  );
  setarCookieRefresh(res, refreshTokenCru);
  return ok(res, { usuario, accessToken });
});

exports.refresh = asyncHandler(async (req, res) => {
  const cru = req.cookies?.[env.COOKIE_NOME_REFRESH] || null;
  const { usuario, accessToken, refreshTokenCru } = await authService.refresh(
    cru,
    contextoDaRequisicao(req)
  );
  setarCookieRefresh(res, refreshTokenCru);
  return ok(res, { usuario, accessToken });
});

exports.logout = asyncHandler(async (req, res) => {
  const cru = req.cookies?.[env.COOKIE_NOME_REFRESH] || null;
  await authService.logout(cru);
  limparCookieRefresh(res);
  return ok(res, { mensagem: 'Sessão encerrada' });
});

exports.eu = asyncHandler(async (req, res) => {
  const usuario = await authService.eu(req.usuario.id);
  return ok(res, { usuario });
});
