const Usuario = require('../models/usuario');
const RefreshToken = require('../models/refreshToken');
const {
  ErroNaoEncontrado,
  ErroProibido,
} = require('../errors/AppError');

function podeOperarUsuario(requisitante, alvoId) {
  if (!requisitante) return false;
  if (requisitante.papel === 'admin') return true;
  return Number(requisitante.id) === Number(alvoId);
}

class UsuarioService {
  async buscarPorId(id) {
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) throw new ErroNaoEncontrado('Usuário não encontrado');
    return usuario;
  }

  async listar({ pagina, limite }) {
    const offset = (pagina - 1) * limite;
    const [itens, total] = await Promise.all([
      Usuario.listar({ limite, offset }),
      Usuario.contar(),
    ]);
    return { itens, total };
  }

  async atualizar(id, dados, requisitante) {
    if (!podeOperarUsuario(requisitante, id)) throw new ErroProibido();
    await this.buscarPorId(id);
    await Usuario.atualizar(id, dados);
    return Usuario.buscarPorId(id);
  }

  async softDelete(id, requisitante) {
    if (!podeOperarUsuario(requisitante, id)) throw new ErroProibido();
    await this.buscarPorId(id);
    await Usuario.softDelete(id);
    // Encerra todas as sessões ativas — segurança ao deletar a conta.
    await RefreshToken.revogarTodosDoUsuario(id);
  }
}

module.exports = new UsuarioService();
