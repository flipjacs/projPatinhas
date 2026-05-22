/**
 * Envelope padrão de resposta da API.
 *
 *   Sucesso (recurso único): { dados: ... }
 *   Sucesso (lista paginada): { dados: [...], meta: { pagina, limite, total } }
 *   Erro:                   { erro: { codigo, mensagem, detalhes? } }
 *
 * O front-end pode confiar 100% nessa forma — qualquer divergência é bug.
 */
function ok(res, dados, status = 200) {
  return res.status(status).json({ dados });
}

function criado(res, dados) {
  return res.status(201).json({ dados });
}

function lista(res, dados, { pagina, limite, total }) {
  return res.status(200).json({
    dados,
    meta: { pagina, limite, total },
  });
}

function semConteudo(res) {
  return res.status(204).end();
}

module.exports = { ok, criado, lista, semConteudo };
