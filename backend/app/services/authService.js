/**
 * Auth: registrar, login, refresh, logout.
 *
 * Estratégia:
 *   • access token JWT curto (15m) no header Authorization;
 *   • refresh opaco longo (30d) em cookie HttpOnly + Secure (em prod);
 *   • rotação a cada refresh: token usado é revogado, novo é emitido;
 *   • duplicate email tratado pela UNIQUE no banco + tentativa de INSERT
 *     (não há TOCTOU);
 *   • senha nunca aparece em nenhuma resposta — sequer o hash.
 */
const Usuario = require('../models/usuario');
const RefreshToken = require('../models/refreshToken');
const senhaUtil = require('../utils/senha');
const tokens = require('../utils/tokens');
const {
  ErroConflito,
  ErroNaoAutorizado,
} = require('../errors/AppError');

function publico(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel,
    telefone: usuario.telefone ?? null,
    cidade: usuario.cidade ?? null,
    estado: usuario.estado ?? null,
    bio: usuario.bio ?? null,
    foto_url: usuario.foto_url ?? null,
  };
}

async function emitirCredenciais(usuario, { user_agent, ip }) {
  const accessToken = tokens.gerarAccessToken(usuario);
  const refresh = tokens.gerarRefreshToken();
  await RefreshToken.criar({
    usuario_id: usuario.id,
    token_hash: refresh.hash,
    expira_em: refresh.expiraEm,
    user_agent,
    ip,
  });
  return { accessToken, refreshTokenCru: refresh.cru };
}

class AuthService {
  async registrar(dados, contexto) {
    const senha_hash = await senhaUtil.gerarHash(dados.senha);
    let id;
    try {
      id = await Usuario.criar({
        nome: dados.nome,
        email: dados.email,
        senha_hash,
        telefone: dados.telefone ?? null,
        cidade: dados.cidade ?? null,
        estado: dados.estado ?? null,
        bio: dados.bio ?? null,
        papel: 'adotante',
      });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new ErroConflito('E-mail já cadastrado');
      }
      throw err;
    }

    const usuario = await Usuario.buscarPorId(id);
    const credenciais = await emitirCredenciais(usuario, contexto);
    return { usuario: publico(usuario), ...credenciais };
  }

  async login({ email, senha }, contexto) {
    const linha = await Usuario.buscarParaAutenticacao(email);
    // Mensagem genérica para não revelar se o e-mail existe.
    if (!linha || linha.deletado_em) {
      throw new ErroNaoAutorizado('E-mail ou senha incorretos');
    }
    const confere = await senhaUtil.conferir(senha, linha.senha_hash);
    if (!confere) {
      throw new ErroNaoAutorizado('E-mail ou senha incorretos');
    }
    const usuario = await Usuario.buscarPorId(linha.id);
    const credenciais = await emitirCredenciais(usuario, contexto);
    return { usuario: publico(usuario), ...credenciais };
  }

  /**
   * Recebe o refresh cru, valida, revoga e emite novo par.
   * Se o token não existir ou já estiver revogado, dispara 401.
   */
  async refresh(refreshCru, contexto) {
    if (!refreshCru) throw new ErroNaoAutorizado('Sessão expirada');
    const hash = tokens.hashRefreshToken(refreshCru);
    const registro = await RefreshToken.buscarValido(hash);
    if (!registro) throw new ErroNaoAutorizado('Sessão expirada');

    // Rotação: revoga o atual e emite novo par.
    await RefreshToken.revogarPorHash(hash);

    const usuario = await Usuario.buscarPorId(registro.usuario_id);
    if (!usuario) throw new ErroNaoAutorizado('Sessão expirada');

    const credenciais = await emitirCredenciais(usuario, contexto);
    return { usuario: publico(usuario), ...credenciais };
  }

  async logout(refreshCru) {
    if (!refreshCru) return;
    const hash = tokens.hashRefreshToken(refreshCru);
    await RefreshToken.revogarPorHash(hash);
  }

  async eu(id) {
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) throw new ErroNaoAutorizado('Sessão inválida');
    return publico(usuario);
  }
}

module.exports = new AuthService();
module.exports.publico = publico;
