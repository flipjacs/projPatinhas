const { z } = require('zod');

const especies = ['cachorro', 'gato', 'outro'];
const portes = ['pequeno', 'medio', 'grande'];
const sexos = ['macho', 'femea', 'desconhecido'];

// Helper para mensagens consistentes em PT-BR.
const obrigatorio = (msg) => ({ message: msg });

const criarAnimalBody = z.object({
  nome: z.string({ required_error: 'Informe o nome do animal' })
    .trim()
    .min(2, 'Nome muito curto (mínimo 2 caracteres)')
    .max(80, 'Nome muito longo'),
  especie: z.enum(especies, obrigatorio('Selecione a espécie')),
  // Raça AGORA é obrigatória — vital para o adotante avaliar o animal.
  // Quando não há raça definida, o usuário deve preencher "SRD".
  raca: z.string({ required_error: 'Informe a raça (ou "SRD")' })
    .trim()
    .min(1, 'Informe a raça (ou "SRD")')
    .max(80, 'Raça muito longa'),
  sexo: z.enum(sexos).default('desconhecido'),
  porte: z.enum(portes, obrigatorio('Selecione o porte')),
  idade_anos: z.coerce.number().int().min(0).max(40).optional(),
  idade_meses: z.coerce.number().int().min(0).max(11).optional(),
  castrado: z.coerce.boolean().default(false),
  vacinado: z.coerce.boolean().default(false),
  descricao: z.string({ required_error: 'Conte um pouco sobre o animal' })
    .trim()
    .min(10, 'Conte um pouco mais (mínimo 10 caracteres)')
    .max(2000, 'Descrição muito longa (máx. 2000 caracteres)'),
  // Foto AGORA é obrigatória — anúncios sem foto têm taxa de adoção quase
  // nula e poluem a busca. Aceita o caminho retornado pelo serviço de
  // uploads (`/uploads/...`) ou URL absoluta legada.
  foto_url: z.string({ required_error: 'Envie uma foto do animal' })
    .trim()
    .min(1, 'Envie uma foto do animal')
    .max(500, 'URL muito longa'),
  ong_id: z.coerce.number().int().positive().optional(),
});

// Update parcial — todos opcionais. Mas quando o campo VEM, valida como no
// criar. `disponivel` é o único campo exclusivo do update. Se o cliente
// quiser remover a foto, deve enviar uma nova; null/string vazia NÃO são
// aceitos para campos obrigatórios.
const atualizarAnimalBody = z
  .object({
    nome: z.string().trim().min(2).max(80).optional(),
    especie: z.enum(especies).optional(),
    raca: z.string().trim().min(1, 'Informe a raça (ou "SRD")').max(80).optional(),
    sexo: z.enum(sexos).optional(),
    porte: z.enum(portes).optional(),
    idade_anos: z.coerce.number().int().min(0).max(40).optional(),
    idade_meses: z.coerce.number().int().min(0).max(11).optional(),
    castrado: z.coerce.boolean().optional(),
    vacinado: z.coerce.boolean().optional(),
    descricao: z.string().trim().min(10).max(2000).optional(),
    foto_url: z.string().trim().min(1, 'Envie uma foto do animal').max(500).optional(),
    ong_id: z.coerce.number().int().positive().optional(),
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
