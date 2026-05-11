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

  static async listarTodos(limite, offset) {
    const [rows] = await pool.query(
      'SELECT id, nome, email, telefone, cidade, estado, criado_em FROM usuarios ORDER BY criado_em DESC LIMIT ? OFFSET ?',
      [limite, offset]
    );
    return rows;
  }

  static async atualizar(id, campos) {
    const camposPermitidos = ['nome', 'telefone', 'cidade', 'estado'];
    const updates = [];
    const valores = [];

    for (const campo of camposPermitidos) {
      if (campos[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        valores.push(campos[campo]);
      }
    }

    if (updates.length === 0) return;

    valores.push(id);
    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      valores
    );
  }

  static async deletar(id) {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

module.exports = Usuario;