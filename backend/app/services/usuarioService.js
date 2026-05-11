const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');

class UsuarioService {
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  validarSenha(senha) {
    return senha && senha.length >= 6;
  }

  async cadastrar({ nome, email, senha, telefone, cidade, estado }) {
    if (!this.validarEmail(email)) {
      throw new Error('Formato de e-mail inválido');
    }

    if (!this.validarSenha(senha)) {
      throw new Error('A senha deve ter no mínimo 6 caracteres');
    }

    const existente = await Usuario.buscarPorEmail(email);
    if (existente) {
      throw new Error('E-mail já cadastrado');
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const id = await Usuario.criar({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senhaCriptografada,
      telefone: telefone ? telefone.trim() : null,
      cidade: cidade ? cidade.trim() : null,
      estado: estado ? estado.trim().toUpperCase() : null
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

  async listarTodos(pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    return await Usuario.listarTodos(limite, offset);
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