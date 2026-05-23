const { z } = require('zod');

const tipos = ['avatar', 'animal', 'ong'];

// Validamos o tipo no body do multipart. O arquivo em si é validado por bytes.
const criarUploadBody = z.object({
  tipo: z.enum(tipos, { errorMap: () => ({ message: "Tipo deve ser 'avatar', 'animal' ou 'ong'" }) }),
});

module.exports = { criarUploadBody, TIPOS_UPLOAD: tipos };
