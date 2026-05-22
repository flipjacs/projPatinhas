const pool = require('../database/connection');

class RefreshToken {
  static async criar({ usuario_id, token_hash, expira_em, user_agent, ip }) {
    const [result] = await pool.query(
      `INSERT INTO refresh_tokens (usuario_id, token_hash, expira_em, user_agent, ip)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, token_hash, expira_em, user_agent ?? null, ip ?? null]
    );
    return result.insertId;
  }

  static async buscarValido(token_hash) {
    const [rows] = await pool.query(
      `SELECT id, usuario_id, expira_em, revogado_em
       FROM refresh_tokens
       WHERE token_hash = ?
         AND revogado_em IS NULL
         AND expira_em > NOW()
       LIMIT 1`,
      [token_hash]
    );
    return rows[0] || null;
  }

  static async revogarPorHash(token_hash) {
    const [result] = await pool.query(
      `UPDATE refresh_tokens SET revogado_em = CURRENT_TIMESTAMP
       WHERE token_hash = ? AND revogado_em IS NULL`,
      [token_hash]
    );
    return result.affectedRows;
  }

  static async revogarTodosDoUsuario(usuario_id) {
    await pool.query(
      `UPDATE refresh_tokens SET revogado_em = CURRENT_TIMESTAMP
       WHERE usuario_id = ? AND revogado_em IS NULL`,
      [usuario_id]
    );
  }
}

module.exports = RefreshToken;
