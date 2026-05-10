const pool = require('../database/connection');

class Animal {
  static async criar({ nome, especie, raca, idade, porte, descricao, foto_url, usuario_id }) {
    const [result] = await pool.query(
      `INSERT INTO animais (nome, especie, raca, idade, porte, descricao, foto_url, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, especie, raca, idade, porte, descricao, foto_url, usuario_id]
    );
    return result.insertId;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT a.*, u.nome AS dono_nome, u.telefone AS dono_telefone, u.cidade AS dono_cidade
       FROM animais a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async listarDisponiveis() {
    const [rows] = await pool.query(
      `SELECT a.*, u.nome AS dono_nome, u.cidade AS dono_cidade
       FROM animais a
       JOIN usuarios u ON a.usuario_id = u.id
       WHERE a.disponivel = TRUE
       ORDER BY a.criado_em DESC`
    );
    return rows;
  }

  static async listarPorUsuario(usuario_id) {
    const [rows] = await pool.query(
      'SELECT * FROM animais WHERE usuario_id = ? ORDER BY criado_em DESC',
      [usuario_id]
    );
    return rows;
  }

  static async atualizar(id, { nome, especie, raca, idade, porte, descricao, foto_url, disponivel }) {
    await pool.query(
      `UPDATE animais SET nome = ?, especie = ?, raca = ?, idade = ?, porte = ?,
       descricao = ?, foto_url = ?, disponivel = ? WHERE id = ?`,
      [nome, especie, raca, idade, porte, descricao, foto_url, disponivel, id]
    );
  }

  static async deletar(id) {
    await pool.query('DELETE FROM animais WHERE id = ?', [id]);
  }
}

module.exports = Animal;