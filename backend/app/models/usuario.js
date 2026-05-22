const pool = require('../database/connection');

const COLUNAS_PUBLICAS = `
  id, nome, email, telefone, cidade, estado, bio, foto_url,
  papel, email_verificado, criado_em, atualizado_em
`;

const ATUALIZAVEIS = ['nome', 'telefone', 'cidade', 'estado', 'bio', 'foto_url'];

class Usuario {
  static async criar({ nome, email, senha_hash, telefone, cidade, estado, bio, papel }) {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, telefone, cidade, estado, bio, papel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, senha_hash, telefone, cidade, estado, bio, papel]
    );
    return result.insertId;
  }

  /** Inclui senha_hash — uso interno (login / refresh). NUNCA retornar via API. */
  static async buscarParaAutenticacao(email) {
    const [rows] = await pool.query(
      `SELECT id, nome, email, senha_hash, papel, deletado_em
       FROM usuarios WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  static async buscarPorEmail(email) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS} FROM usuarios
       WHERE email = ? AND deletado_em IS NULL LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS} FROM usuarios
       WHERE id = ? AND deletado_em IS NULL LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async listar({ limite, offset }) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_PUBLICAS} FROM usuarios
       WHERE deletado_em IS NULL
       ORDER BY criado_em DESC LIMIT ? OFFSET ?`,
      [limite, offset]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios WHERE deletado_em IS NULL`
    );
    return rows[0].total;
  }

  static async atualizar(id, campos) {
    const updates = [];
    const valores = [];
    for (const campo of ATUALIZAVEIS) {
      if (campos[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        valores.push(campos[campo]);
      }
    }
    if (!updates.length) return 0;
    valores.push(id);
    const [result] = await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ? AND deletado_em IS NULL`,
      valores
    );
    return result.affectedRows;
  }

  static async softDelete(id) {
    const [result] = await pool.query(
      `UPDATE usuarios SET deletado_em = CURRENT_TIMESTAMP
       WHERE id = ? AND deletado_em IS NULL`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Usuario;
