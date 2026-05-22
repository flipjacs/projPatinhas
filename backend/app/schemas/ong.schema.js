const { z } = require('zod');
const { telefoneBR, estadoUF, cnpj } = require('./comum.schema');

const criarOngBody = z.object({
  nome_fantasia: z.string().trim().min(2).max(140),
  cnpj: cnpj.optional(),
  descricao: z.string().trim().max(2000).optional(),
  site: z.string().trim().url().max(255).optional(),
  instagram: z.string().trim().max(120).optional(),
  whatsapp: telefoneBR.optional(),
  endereco: z.string().trim().max(255).optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: estadoUF.optional(),
});

const atualizarOngBody = criarOngBody.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Envie ao menos um campo para atualizar' }
);

module.exports = { criarOngBody, atualizarOngBody };
