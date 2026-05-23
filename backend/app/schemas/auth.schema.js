const { z } = require('zod');
const { telefoneBR, estadoUF } = require('./comum.schema');

const senhaForte = z
  .string({ required_error: 'Informe sua senha' })
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(72, 'Senha muito longa') // limite do bcrypt
  .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'Inclua ao menos um número');

// Registro de usuário. telefone/cidade/estado AGORA são obrigatórios — a
// plataforma precisa desses campos para conectar adotantes e ONGs por
// região e permitir contato. Foto fica opcional aqui (incentivada após
// o login pela página de perfil).
const registrarBody = z.object({
  nome: z.string({ required_error: 'Informe seu nome completo' })
    .trim()
    .min(2, 'Informe seu nome completo')
    .max(120, 'Nome muito longo'),
  email: z.string({ required_error: 'Informe seu e-mail' })
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido')
    .max(180, 'E-mail muito longo'),
  senha: senhaForte,
  telefone: telefoneBR,
  cidade: z.string({ required_error: 'Informe sua cidade' })
    .trim()
    .min(1, 'Informe sua cidade')
    .max(80, 'Cidade muito longa'),
  estado: estadoUF,
  bio: z.string().trim().max(280, 'Máx. 280 caracteres').optional(),
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido'),
  senha: z.string().min(1, 'Informe sua senha'),
});

module.exports = { registrarBody, loginBody, senhaForte };
