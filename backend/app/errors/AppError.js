/**
 * Hierarquia de erros do domínio.
 *
 * Regra:
 *   • Camadas de service/model SEMPRE lançam uma subclasse de AppError.
 *   • Controllers NÃO fazem try/catch específico — apenas next(err).
 *   • O middleware central converte AppError em JSON e mapeia status code.
 *   • Qualquer outro erro vira 500 INTERNO sem vazar mensagem em produção.
 *
 * `codigo` é estável e legível pelo cliente; `mensagem` é amigável ao usuário;
 * `detalhes` (opcional) carrega informação estruturada (ex: campos inválidos).
 */
class AppError extends Error {
  constructor({ codigo, mensagem, statusCode, detalhes }) {
    super(mensagem);
    this.name = this.constructor.name;
    this.codigo = codigo;
    this.statusCode = statusCode;
    if (detalhes !== undefined) this.detalhes = detalhes;
  }
}

class ErroValidacao extends AppError {
  constructor(mensagem = 'Dados inválidos', detalhes) {
    super({ codigo: 'VALIDACAO', mensagem, statusCode: 400, detalhes });
  }
}

class ErroNaoAutorizado extends AppError {
  constructor(mensagem = 'Autenticação requerida') {
    super({ codigo: 'NAO_AUTORIZADO', mensagem, statusCode: 401 });
  }
}

class ErroProibido extends AppError {
  constructor(mensagem = 'Você não tem permissão para esta ação') {
    super({ codigo: 'PROIBIDO', mensagem, statusCode: 403 });
  }
}

class ErroNaoEncontrado extends AppError {
  constructor(mensagem = 'Recurso não encontrado') {
    super({ codigo: 'NAO_ENCONTRADO', mensagem, statusCode: 404 });
  }
}

class ErroConflito extends AppError {
  constructor(mensagem = 'Conflito de dados', detalhes) {
    super({ codigo: 'CONFLITO', mensagem, statusCode: 409, detalhes });
  }
}

class ErroLimiteRequisicoes extends AppError {
  constructor(mensagem = 'Muitas tentativas. Tente novamente mais tarde.') {
    super({ codigo: 'MUITAS_TENTATIVAS', mensagem, statusCode: 429 });
  }
}

module.exports = {
  AppError,
  ErroValidacao,
  ErroNaoAutorizado,
  ErroProibido,
  ErroNaoEncontrado,
  ErroConflito,
  ErroLimiteRequisicoes,
};
