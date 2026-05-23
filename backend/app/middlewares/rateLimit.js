/**
 * Limites de requisição.
 *
 * Vagaroso em rotas sensíveis (login, registro) para mitigar brute force,
 * generoso no resto. Resposta segue o envelope padrão de erro.
 */
const rateLimit = require('express-rate-limit');

function envelopeErro(_req, res) {
  return res.status(429).json({
    erro: {
      codigo: 'MUITAS_TENTATIVAS',
      mensagem: 'Muitas tentativas. Tente novamente em instantes.',
    },
  });
}

const limitadorAuth = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: envelopeErro,
});

const limitadorGlobal = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: envelopeErro,
});

// Uploads são caros (sharp + I/O). Limitamos por usuário autenticado quando
// possível e cai para IP em chamadas anônimas — defesa contra abuso/flood.
const limitadorUpload = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => (req.usuario?.id ? `u:${req.usuario.id}` : `ip:${req.ip}`),
  handler: envelopeErro,
});

module.exports = { limitadorAuth, limitadorGlobal, limitadorUpload };
