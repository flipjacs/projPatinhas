/**
 * Schemas reutilizáveis: params com ID, paginação, formatos comuns.
 * Mantenha em PT-BR para alinhamento end-to-end com o front-end.
 */
const { z } = require('zod');

const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

const idUsuarioParam = z.object({
  usuario_id: z.coerce.number().int().positive(),
});

const paginacao = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(20),
});

// Regex de telefone BR — aceita com ou sem máscara, com DDD obrigatório.
const telefoneBR = z
  .string({ required_error: 'Informe um telefone para contato' })
  .trim()
  .min(1, 'Informe um telefone para contato')
  .regex(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, 'Use o formato (11) 99999-9999');

const estadoUF = z
  .string({ required_error: 'Informe seu estado' })
  .trim()
  .length(2, 'UF deve ter 2 letras')
  .transform((s) => s.toUpperCase());

const cnpj = z
  .string()
  .trim()
  .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos numéricos');

module.exports = {
  idParam,
  idUsuarioParam,
  paginacao,
  telefoneBR,
  estadoUF,
  cnpj,
};
