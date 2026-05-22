const pool = require('../database/connection');

const COLUNAS = `
  ad.id, ad.animal_id, ad.adotante_id, ad.status, ad.mensagem, ad.resposta,
  ad.criado_em, ad.decidido_em, ad.atualizado_em
`;

class Adocao {
  static async criar({ animal_id, adotante_id, mensagem }) {
    const [result] = await pool.query(
      `INSERT INTO adocoes (animal_id, adotante_id, mensagem)
       VALUES (?, ?, ?)`,
      [animal_id, adotante_id, mensagem]
    );
    return result.insertId;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS},
              a.nome AS animal_nome, a.usuario_id AS dono_id,
              u.nome AS adotante_nome
       FROM adocoes ad
       JOIN animais a ON a.id = ad.animal_id
       JOIN usuarios u ON u.id = ad.adotante_id
       WHERE ad.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async existeAtivaParaAnimalDoAdotante({ animal_id, adotante_id }) {
    const [rows] = await pool.query(
      `SELECT id FROM adocoes
       WHERE animal_id = ? AND adotante_id = ?
         AND status IN ('pendente','aprovada')
       LIMIT 1`,
      [animal_id, adotante_id]
    );
    return rows.length > 0;
  }

  static async listarPorAdotante({ adotante_id, status, limite, offset }) {
    const where = ['ad.adotante_id = ?'];
    const params = [adotante_id];
    if (status) { where.push('ad.status = ?'); params.push(status); }
    const [rows] = await pool.query(
      `SELECT ${COLUNAS}, a.nome AS animal_nome, a.foto_url AS animal_foto
       FROM adocoes ad
       JOIN animais a ON a.id = ad.animal_id
       WHERE ${where.join(' AND ')}
       ORDER BY ad.criado_em DESC LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    return rows;
  }

  static async contarPorAdotante({ adotante_id, status }) {
    const where = ['adotante_id = ?'];
    const params = [adotante_id];
    if (status) { where.push('status = ?'); params.push(status); }
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM adocoes WHERE ${where.join(' AND ')}`,
      params
    );
    return rows[0].total;
  }

  static async listarPorDono({ dono_id, status, limite, offset }) {
    const where = ['a.usuario_id = ?'];
    const params = [dono_id];
    if (status) { where.push('ad.status = ?'); params.push(status); }
    const [rows] = await pool.query(
      `SELECT ${COLUNAS},
              a.nome AS animal_nome,
              u.nome AS adotante_nome, u.email AS adotante_email,
              u.telefone AS adotante_telefone, u.cidade AS adotante_cidade
       FROM adocoes ad
       JOIN animais a ON a.id = ad.animal_id
       JOIN usuarios u ON u.id = ad.adotante_id
       WHERE ${where.join(' AND ')}
       ORDER BY ad.criado_em DESC LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    return rows;
  }

  static async contarPorDono({ dono_id, status }) {
    const where = ['a.usuario_id = ?'];
    const params = [dono_id];
    if (status) { where.push('ad.status = ?'); params.push(status); }
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM adocoes ad
       JOIN animais a ON a.id = ad.animal_id
       WHERE ${where.join(' AND ')}`,
      params
    );
    return rows[0].total;
  }

  static async atualizarStatus(id, { status, resposta }) {
    const [result] = await pool.query(
      `UPDATE adocoes
       SET status = ?, resposta = COALESCE(?, resposta), decidido_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, resposta ?? null, id]
    );
    return result.affectedRows;
  }
}

module.exports = Adocao;
