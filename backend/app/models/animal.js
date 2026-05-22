const pool = require('../database/connection');

const COLUNAS_BASE = `
  a.id, a.usuario_id, a.ong_id, a.nome, a.especie, a.raca, a.sexo, a.porte,
  a.idade_anos, a.idade_meses, a.castrado, a.vacinado,
  a.descricao, a.foto_url, a.disponivel, a.criado_em, a.atualizado_em
`;

const COLUNAS_JOIN = `
  u.nome AS dono_nome, u.cidade AS dono_cidade,
  o.nome_fantasia AS ong_nome
`;

const ATUALIZAVEIS = [
  'nome', 'especie', 'raca', 'sexo', 'porte', 'idade_anos', 'idade_meses',
  'castrado', 'vacinado', 'descricao', 'foto_url', 'disponivel', 'ong_id',
];

function montarFiltros({ especie, porte, cidade }) {
  const where = ['a.deletado_em IS NULL', 'a.disponivel = 1'];
  const valores = [];
  if (especie) { where.push('a.especie = ?'); valores.push(especie); }
  if (porte)   { where.push('a.porte = ?');   valores.push(porte); }
  if (cidade)  { where.push('u.cidade = ?');  valores.push(cidade); }
  return { whereSql: where.join(' AND '), valores };
}

class Animal {
  static async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO animais
        (usuario_id, ong_id, nome, especie, raca, sexo, porte,
         idade_anos, idade_meses, castrado, vacinado,
         descricao, foto_url, disponivel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        dados.usuario_id, dados.ong_id ?? null,
        dados.nome, dados.especie, dados.raca ?? null,
        dados.sexo ?? 'desconhecido', dados.porte,
        dados.idade_anos ?? null, dados.idade_meses ?? null,
        dados.castrado ? 1 : 0, dados.vacinado ? 1 : 0,
        dados.descricao, dados.foto_url ?? null,
      ]
    );
    return result.insertId;
  }

  static async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_BASE}, ${COLUNAS_JOIN}
       FROM animais a
       JOIN usuarios u ON u.id = a.usuario_id AND u.deletado_em IS NULL
       LEFT JOIN ongs o ON o.id = a.ong_id AND o.deletado_em IS NULL
       WHERE a.id = ? AND a.deletado_em IS NULL LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async listarDisponiveis({ limite, offset, filtros = {} }) {
    const { whereSql, valores } = montarFiltros(filtros);
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_BASE}, ${COLUNAS_JOIN}
       FROM animais a
       JOIN usuarios u ON u.id = a.usuario_id AND u.deletado_em IS NULL
       LEFT JOIN ongs o ON o.id = a.ong_id AND o.deletado_em IS NULL
       WHERE ${whereSql}
       ORDER BY a.criado_em DESC LIMIT ? OFFSET ?`,
      [...valores, limite, offset]
    );
    return rows;
  }

  static async contarDisponiveis(filtros = {}) {
    const { whereSql, valores } = montarFiltros(filtros);
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM animais a
       JOIN usuarios u ON u.id = a.usuario_id AND u.deletado_em IS NULL
       LEFT JOIN ongs o ON o.id = a.ong_id AND o.deletado_em IS NULL
       WHERE ${whereSql}`,
      valores
    );
    return rows[0].total;
  }

  static async listarPorUsuario(usuario_id) {
    const [rows] = await pool.query(
      `SELECT ${COLUNAS_BASE}
       FROM animais a
       WHERE a.usuario_id = ? AND a.deletado_em IS NULL
       ORDER BY a.criado_em DESC`,
      [usuario_id]
    );
    return rows;
  }

  static async atualizar(id, campos) {
    const updates = [];
    const valores = [];
    for (const campo of ATUALIZAVEIS) {
      if (campos[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        let v = campos[campo];
        if (campo === 'castrado' || campo === 'vacinado' || campo === 'disponivel') {
          v = v ? 1 : 0;
        }
        valores.push(v);
      }
    }
    if (!updates.length) return 0;
    valores.push(id);
    const [result] = await pool.query(
      `UPDATE animais SET ${updates.join(', ')} WHERE id = ? AND deletado_em IS NULL`,
      valores
    );
    return result.affectedRows;
  }

  static async softDelete(id) {
    const [result] = await pool.query(
      `UPDATE animais SET deletado_em = CURRENT_TIMESTAMP, disponivel = 0
       WHERE id = ? AND deletado_em IS NULL`,
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = Animal;
