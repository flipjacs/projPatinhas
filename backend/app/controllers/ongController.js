const ongService = require('../services/ongService');
const { ok, criado, lista, semConteudo } = require('../utils/responder');
const asyncHandler = require('../utils/asyncHandler');

exports.criar = asyncHandler(async (req, res) => {
  const ong = await ongService.criar(req.usuario.id, req.body);
  return criado(res, { ong });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const ong = await ongService.buscarPorId(req.params.id);
  return ok(res, { ong });
});

exports.listar = asyncHandler(async (req, res) => {
  const { pagina, limite } = req.query;
  const { itens, total } = await ongService.listar({ pagina, limite });
  return lista(res, itens, { pagina, limite, total });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const ong = await ongService.atualizar(req.params.id, req.body, req.usuario);
  return ok(res, { ong });
});

exports.deletar = asyncHandler(async (req, res) => {
  await ongService.softDelete(req.params.id, req.usuario);
  return semConteudo(res);
});
