const pool = require('../database/connection');

class Usuario {
  static async criar({ nome, email, senha, telefone, cidade, estado }) {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, telefone, cidade, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, senha, telefone, cidade, estado]
    );
    return result.insertId;
  }

  static async buscarPorEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, cidade, estado, criado_em FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async listarTodos() {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, cidade, estado, criado_em FROM usuarios'
    );
    return rows;
  }

  static async atualizar(id, { nome, telefone, cidade, estado }) {
    await pool.query(
      'UPDATE usuarios SET nome = ?, telefone = ?, cidade = ?, estado = ? WHERE id = ?',
      [nome, telefone, cidade, estado, id]
    );
  }

  static async deletar(id) {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

module.exports = Usuario;