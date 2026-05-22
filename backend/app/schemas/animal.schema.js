const { z } = require('zod');

const especies = ['cachorro', 'gato', 'outro'];
const portes = ['pequeno', 'medio', 'grande'];
const sexos = ['macho', 'femea', 'desconhecido'];

const criarAnimalBody = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do animal').max(80),
  especie: z.enum(especies),
  raca: z.string().trim().max(80).optional(),
  sexo: z.enum(sexos).default('desconhecido'),
  porte: z.enum(portes),
  idade_anos: z.coerce.number().int().min(0).max(40).optional(),
  idade_meses: z.coerce.number().int().min(0).max(11).optional(),
  castrado: z.coerce.boolean().default(false),
  vacinado: z.coerce.boolean().default(false),
  descricao: z.string().trim().min(10, 'Conte um pouco mais (mínimo 10 caracteres)').max(2000),
  foto_url: z.string().trim().url().max(500).optional(),
  ong_id: z.coerce.number().int().positive().optional(),
});

const atualizarAnimalBody = criarAnimalBody
  .partial()
  .extend({
    disponivel: z.coerce.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

const filtrosListagem = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(20),
  especie: z.enum(especies).optional(),
  porte: z.enum(portes).optional(),
  cidade: z.string().trim().max(80).optional(),
});

module.exports = {
  criarAnimalBody,
  atualizarAnimalBody,
  filtrosListagem,
  ESPECIES: especies,
  PORTES: portes,
  SEXOS: sexos,
};
