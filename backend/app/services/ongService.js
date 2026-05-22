/**
 * Regras de ONG:
 *   • Cada usuário tem no máximo UMA ONG (constraint UNIQUE + verificação).
 *   • Criar a ONG promove o papel do usuário para 'ong'.
 *   • Apenas o dono da ONG (ou admin) pode atualizar/deletar.
 *   • `verificada` é toggled exclusivamente por admin (não exposto aqui).
 */
const Ong = require('../models/ong');
const Usuario = require('../models/usuario');
const pool = require('../database/connection');
const {
  ErroNaoEncontrado,
  ErroConflito,
  ErroProibido,
} = require('../errors/AppError');

function podeOperarOng(requisitante, ong) {
  if (!requisitante) return false;
  if (requisitante.papel === 'admin') return true;
  return Number(requisitante.id) === Number(ong.usuario_id);
}

class OngService {
  async criar(usuario_id, dados) {
    const existente = await Ong.buscarPorUsuario(usuario_id);
    if (existente) throw new ErroConflito('Este usuário já possui uma ONG cadastrada');

    let id;
    try {
      id = await Ong.criar({ ...dados, usuario_id });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new ErroConflito('CNPJ ou vínculo de usuário já cadastrado');
      }
      throw err;
    }

    // Promove o papel — em transação simples (sem START TRANSACTION
    // pois mysql2 pool.query opera fora de transação por padrão; para
    // garantir atomicidade real usaria getConnection + beginTransaction;
    // aqui o pior caso é uma ONG criada com usuário ainda 'adotante',
    // o que o admin pode corrigir manualmente — risco aceitável para v1).
    await pool.query(
      `UPDATE usuarios SET papel = 'ong' WHERE id = ? AND papel <> 'admin'`,
      [usuario_id]
    );

    return Ong.buscarPorId(id);
  }

  async buscarPorId(id) {
    const ong = await Ong.buscarPorId(id);
    if (!ong) throw new ErroNaoEncontrado('ONG não encontrada');
    return ong;
  }

  async listar({ pagina, limite }) {
    const offset = (pagina - 1) * limite;
    const [itens, total] = await Promise.all([
      Ong.listar({ limite, offset }),
      Ong.contar(),
    ]);
    return { itens, total };
  }

  async atualizar(id, dados, requisitante) {
    const ong = await this.buscarPorId(id);
    if (!podeOperarOng(requisitante, ong)) throw new ErroProibido();
    try {
      await Ong.atualizar(id, dados);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        throw new ErroConflito('CNPJ já cadastrado');
      }
      throw err;
    }
    return Ong.buscarPorId(id);
  }

  async softDelete(id, requisitante) {
    const ong = await this.buscarPorId(id);
    if (!podeOperarOng(requisitante, ong)) throw new ErroProibido();
    await Ong.softDelete(id);
  }
}

module.exports = new OngService();
