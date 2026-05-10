const Animal = require('../models/animal');
const Usuario = require('../models/usuario');

class AnimalService {
  async cadastrar({ nome, especie, raca, idade, porte, descricao, foto_url, usuario_id }) {
    const usuario = await Usuario.buscarPorId(usuario_id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const id = await Animal.criar({
      nome, especie, raca, idade, porte, descricao, foto_url, usuario_id
    });

    return await Animal.buscarPorId(id);
  }

  async buscarPorId(id) {
    const animal = await Animal.buscarPorId(id);
    if (!animal) {
      throw new Error('Animal não encontrado');
    }
    return animal;
  }

  async listarDisponiveis() {
    return await Animal.listarDisponiveis();
  }

  async listarPorUsuario(usuario_id) {
    return await Animal.listarPorUsuario(usuario_id);
  }

  async atualizar(id, dados) {
    await this.buscarPorId(id);
    await Animal.atualizar(id, dados);
    return await Animal.buscarPorId(id);
  }

  async deletar(id) {
    await this.buscarPorId(id);
    await Animal.deletar(id);
  }
}

module.exports = new AnimalService();