const { z } = require('zod');
const { telefoneBR, estadoUF } = require('./comum.schema');

// Atualização parcial de perfil — todos os campos opcionais,
// mas pelo menos um deve estar presente.
const atualizarUsuarioBody = z
  .object({
    nome: z.string().trim().min(2).max(120).optional(),
    telefone: telefoneBR.optional(),
    cidade: z.string().trim().max(80).optional(),
    estado: estadoUF.optional(),
    bio: z.string().trim().max(280).optional(),
    foto_url: z.string().trim().url().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

module.exports = { atualizarUsuarioBody };
