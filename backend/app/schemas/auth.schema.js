const { z } = require('zod');
const { telefoneBR, estadoUF } = require('./comum.schema');

const senhaForte = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(72, 'Senha muito longa') // limite do bcrypt
  .regex(/[A-Z]/, 'Inclua ao menos uma letra maiúscula')
  .regex(/[0-9]/, 'Inclua ao menos um número');

const registrarBody = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome completo').max(120),
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido').max(180),
  senha: senhaForte,
  telefone: telefoneBR.optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: estadoUF.optional(),
  bio: z.string().trim().max(280).optional(),
});

const loginBody = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido'),
  senha: z.string().min(1, 'Informe sua senha'),
});

module.exports = { registrarBody, loginBody, senhaForte };
