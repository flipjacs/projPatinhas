const animalService = require('../services/animalService');
const { ok, criado, lista, semConteudo } = require('../utils/responder');
const asyncHandler = require('../utils/asyncHandler');
const { derivarVariantes } = require('../utils/variantesImagem');

// Adiciona `imagens` derivado de `foto_url` para o frontend montar srcset
// responsivo sem precisar de outra rota. Mantemos `foto_url` por compat.
function representar(animal) {
  if (!animal) return animal;
  return { ...animal, imagens: derivarVariantes(animal.foto_url) };
}

exports.cadastrar = asyncHandler(async (req, res) => {
  const animal = await animalService.cadastrar(req.usuario, req.body);
  return criado(res, { animal: representar(animal) });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const animal = await animalService.buscarPorId(req.params.id);
  return ok(res, { animal: representar(animal) });
});

exports.listarDisponiveis = asyncHandler(async (req, res) => {
  const { pagina, limite, especie, porte, cidade } = req.query;
  const { itens, total } = await animalService.listarDisponiveis({
    pagina, limite, especie, porte, cidade,
  });
  return lista(res, itens.map(representar), { pagina, limite, total });
});

exports.listarPorUsuario = asyncHandler(async (req, res) => {
  const animais = await animalService.listarPorUsuario(req.params.usuario_id);
  return ok(res, { animais: animais.map(representar) });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const animal = await animalService.atualizar(req.params.id, req.body, req.usuario);
  return ok(res, { animal: representar(animal) });
});

exports.deletar = asyncHandler(async (req, res) => {
  await animalService.softDelete(req.params.id, req.usuario);
  return semConteudo(res);
});
