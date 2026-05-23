const uploadService = require('../services/uploadService');
const { ok, criado, semConteudo } = require('../utils/responder');
const asyncHandler = require('../utils/asyncHandler');

exports.criar = asyncHandler(async (req, res) => {
  const upload = await uploadService.criar(req.usuario, req.file, req.body);
  return criado(res, { upload: uploadService.representar(upload) });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const upload = await uploadService.buscarPorId(req.params.id);
  return ok(res, { upload: uploadService.representar(upload) });
});

exports.remover = asyncHandler(async (req, res) => {
  await uploadService.remover(req.params.id, req.usuario);
  return semConteudo(res);
});
