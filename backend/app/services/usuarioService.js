const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

class UsuarioService {
  async cadastrar({ nome, email, senha, telefone, cidade, estado }) {
    const existente = await Usuario.buscarPorEmail(email);
    if (existente) {
      throw new Error('E-mail já cadastrado');
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const id = await Usuario.criar({
      nome,
      email,
      senha: senhaCriptografada,
      telefone,
      cidade,
      estado
    });

    return { id, nome, email };
  }

  async buscarPorId(id) {
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  }

  async listarTodos() {
    return await Usuario.listarTodos();
  }

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    await Usuario.atualizar(id, dados);
    return await Usuario.buscarPorId(id);
  }

  async deletar(id) {
    await this.buscarPorId(id);
    await Usuario.deletar(id);
  }
}

module.exports = new UsuarioService();