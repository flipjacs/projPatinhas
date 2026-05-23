/**
 * Helpers para consumir o objeto `error.api` produzido pelo interceptor
 * em services/http.js.
 *
 *   { codigo, mensagem, campos, status? }
 *
 * Componentes não devem acessar `error.response.data` diretamente — usem
 * estes helpers para manter a UI desacoplada do envelope HTTP.
 */

export function mensagemDoErro(erro, padrao = "Algo deu errado.") {
  return erro?.api?.mensagem || padrao;
}

export function codigoDoErro(erro) {
  return erro?.api?.codigo || "DESCONHECIDO";
}

export function camposDoErro(erro) {
  return erro?.api?.campos || {};
}

/**
 * Aplica os erros de campo do backend ao react-hook-form, se houver.
 * Campos não presentes no form caem em um "_form" genérico.
 */
export function aplicarErrosRHF(erro, setError, todosCampos = []) {
  const campos = camposDoErro(erro);
  let aplicouAlgum = false;
  for (const [nome, mensagens] of Object.entries(campos)) {
    if (todosCampos.length === 0 || todosCampos.includes(nome)) {
      setError(nome, { type: "server", message: mensagens?.[0] || "Inválido" });
      aplicouAlgum = true;
    }
  }
  return aplicouAlgum;
}
