/**
 * Middleware genérico de validação com Zod.
 *
 *   validar({ body: schema, query: schema, params: schema })
 *
 * Faz o `safeParse` da fonte indicada e substitui o `req[fonte]` pelo objeto
 * já tipado/normalizado (ex: strings convertidas em number, etc.).
 * Em caso de erro, dispara ErroValidacao com `detalhes` em formato amigável.
 */
const { ErroValidacao } = require('../errors/AppError');

function formatarErros(zodError) {
  const campos = {};
  for (const issue of zodError.issues) {
    const chave = issue.path.length ? issue.path.join('.') : '_';
    if (!campos[chave]) campos[chave] = [];
    campos[chave].push(issue.message);
  }
  return { campos };
}

function validar(schemas = {}) {
  return (req, _res, next) => {
    for (const fonte of ['body', 'query', 'params']) {
      const schema = schemas[fonte];
      if (!schema) continue;
      const resultado = schema.safeParse(req[fonte]);
      if (!resultado.success) {
        return next(new ErroValidacao('Dados inválidos', formatarErros(resultado.error)));
      }
      req[fonte] = resultado.data;
    }
    return next();
  };
}

module.exports = { validar };
