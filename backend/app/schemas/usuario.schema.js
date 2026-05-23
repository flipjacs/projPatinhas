const { z } = require('zod');
const { telefoneBR, estadoUF } = require('./comum.schema');

// Atualização parcial de perfil — cada campo é opcional, mas quando ENVIADO
// deve passar pela mesma validação canônica (formato, tamanho, conteúdo).
// `null` NÃO é aceito para campos hoje considerados obrigatórios do perfil
// (telefone, cidade, estado, foto_url) — eles são "rich required": opcionais
// no PATCH, obrigatórios em forma quando vierem.
const atualizarUsuarioBody = z
  .object({
    nome: z.string().trim().min(2, 'Informe seu nome').max(120, 'Nome muito longo').optional(),
    telefone: telefoneBR.optional(),
    cidade: z.string()
      .trim()
      .min(1, 'Informe sua cidade')
      .max(80, 'Cidade muito longa')
      .optional(),
    estado: estadoUF.optional(),
    bio: z.string().trim().max(280, 'Máx. 280 caracteres').optional(),
    // Foto de perfil — quando enviada, deve ser uma URL válida. Não aceita
    // string vazia. Para "limpar" a foto a UI não permite mais (campo é
    // obrigatório no front), e null não é aceito aqui.
    foto_url: z.string()
      .trim()
      .min(1, 'Envie uma foto de perfil')
      .max(500, 'URL muito longa')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos um campo para atualizar',
  });

module.exports = { atualizarUsuarioBody };
