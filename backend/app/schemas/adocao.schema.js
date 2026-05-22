const { z } = require('zod');

const statuses = ['pendente', 'aprovada', 'rejeitada', 'concluida', 'cancelada'];

const criarAdocaoBody = z.object({
  animal_id: z.coerce.number().int().positive(),
  mensagem: z.string().trim().min(10, 'Conte um pouco sobre você').max(2000),
});

const decidirAdocaoBody = z.object({
  status: z.enum(['aprovada', 'rejeitada', 'concluida', 'cancelada']),
  resposta: z.string().trim().max(2000).optional(),
});

const filtrosAdocao = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(statuses).optional(),
});

module.exports = {
  criarAdocaoBody,
  decidirAdocaoBody,
  filtrosAdocao,
  STATUSES: statuses,
};
