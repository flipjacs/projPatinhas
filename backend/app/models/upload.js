/**
 * Modelo de uploads. Esconde SQL e converte ressalvas do MySQL para JS.
 */
const pool = require('../database/connection');

const COLUNAS = `
  id, usuario_id, tipo, hash, nome_original, mime, tamanho_bytes,
  largura, altura,
  caminho_original, caminho_otimizado, caminho_card, caminho_thumb,
  criado_em
`;

class Upload {
  static async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO uploads
        (usuario_id, tipo, hash, nome_original, mime, tamanho_bytes,
         largura, altura,
         caminho_original, caminho_otimizado, caminho_card, caminho_thumb)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.usuario_id, dados.tipo, dados.hash, dados.nome_original,
        dados.mime, dados.tamanho_bytes,
        dados.largura ?? null, dados.altura ?? null,
        dados.caminho_original,
        dados.caminho_otimizado ?? null,
        dados.caminho_card ?? null,
        dados.caminho_thumb ?? null,
      ]
    );
    return result.insertId;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS} FROM uploads
       WHERE id = ? AND deletado_em IS NULL LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async listarPorUsuario({ usuario_id, tipo, limite, offset }) {
    const where = ['usuario_id = ?', 'deletado_em IS NULL'];
    const params = [usuario_id];
    if (tipo) { where.push('tipo = ?'); params.push(tipo); }
    const [rows] = await pool.query(
      `SELECT ${COLUNAS} FROM uploads
       WHERE ${where.join(' AND ')}
       ORDER BY criado_em DESC LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    return rows;
  }

  static async softDelete(id) {
    const [result] = await pool.query(
      `UPDATE uploads SET deletado_em = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Upload;
