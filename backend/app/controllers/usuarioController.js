const usuarioService = require('../services/usuarioService');
const { ok, lista, semConteudo } = require('../utils/responder');
const asyncHandler = require('../utils/asyncHandler');
const { derivarVariantes } = require('../utils/variantesImagem');

function representar(usuario) {
  if (!usuario) return usuario;
  return { ...usuario, imagens: derivarVariantes(usuario.foto_url) };
}

exports.buscarPorId = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.buscarPorId(req.params.id);
  return ok(res, { usuario: representar(usuario) });
});

exports.listar = asyncHandler(async (req, res) => {
  const { pagina, limite } = req.query;
  const { itens, total } = await usuarioService.listar({ pagina, limite });
  return lista(res, itens.map(representar), { pagina, limite, total });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.atualizar(req.params.id, req.body, req.usuario);
  return ok(res, { usuario: representar(usuario) });
});

exports.deletar = asyncHandler(async (req, res) => {
  await usuarioService.softDelete(req.params.id, req.usuario);
  return semConteudo(res);
});
