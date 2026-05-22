const adocaoService = require('../services/adocaoService');
const { ok, criado, lista } = require('../utils/responder');
const asyncHandler = require('../utils/asyncHandler');

exports.criar = asyncHandler(async (req, res) => {
  const adocao = await adocaoService.criar(req.usuario, req.body);
  return criado(res, { adocao });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const adocao = await adocaoService.buscarPorId(req.params.id);
  return ok(res, { adocao });
});

exports.minhas = asyncHandler(async (req, res) => {
  const { pagina, limite, status } = req.query;
  const { itens, total } = await adocaoService.minhasSolicitacoes({
    adotante_id: req.usuario.id, pagina, limite, status,
  });
  return lista(res, itens, { pagina, limite, total });
});

exports.recebidas = asyncHandler(async (req, res) => {
  const { pagina, limite, status } = req.query;
  const { itens, total } = await adocaoService.recebidas({
    dono_id: req.usuario.id, pagina, limite, status,
  });
  return lista(res, itens, { pagina, limite, total });
});

exports.decidir = asyncHandler(async (req, res) => {
  const adocao = await adocaoService.decidir(req.params.id, req.usuario, req.body);
  return ok(res, { adocao });
});
