const pool = require('../database/connection');

const COLUNAS = `
  id, usuario_id, nome_fantasia, cnpj, descricao, site, instagram,
  whatsapp, endereco, cidade, estado, verificada, criado_em, atualizado_em
`;

const ATUALIZAVEIS = [
  'nome_fantasia', 'cnpj', 'descricao', 'site', 'instagram',
  'whatsapp', 'endereco', 'cidade', 'estado',
];

class Ong {
  static async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO ongs
        (usuario_id, nome_fantasia, cnpj, descricao, site, instagram,
         whatsapp, endereco, cidade, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.usuario_id, dados.nome_fantasia, dados.cnpj, dados.descricao,
        dados.site, dados.instagram, dados.whatsapp,
        dados.endereco, dados.cidade, dados.estado,
      ]
    );
    return result.insertId;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS} FROM ongs
       WHERE id = ? AND deletado_em IS NULL LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async buscarPorUsuario(usuario_id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS} FROM ongs
       WHERE usuario_id = ? AND deletado_em IS NULL LIMIT 1`,
      [usuario_id]
    );
    return rows[0] || null;
  }

  static async listar({ limite, offset }) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS} FROM ongs
       WHERE deletado_em IS NULL
       ORDER BY verificada DESC, criado_em DESC LIMIT ? OFFSET ?`,
      [limite, offset]
    );
    return rows;
  }

  static async contar() {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM ongs WHERE deletado_em IS NULL`
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
      `UPDATE ongs SET ${updates.join(', ')} WHERE id = ? AND deletado_em IS NULL`,
      valores
    );
    return result.affectedRows;
  }

  static async softDelete(id) {
    const [result] = await pool.query(
      `UPDATE ongs SET deletado_em = CURRENT_TIMESTAMP
       WHERE id = ? AND deletado_em IS NULL`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Ong;
