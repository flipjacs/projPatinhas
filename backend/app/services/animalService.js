const Animal = require('../models/animal');
const Usuario = require('../models/usuario');

class AnimalService {
  async cadastrar({ nome, especie, raca, idade, porte, descricao, foto_url, usuario_id }) {
    const usuario = await Usuario.buscarPorId(usuario_id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const especiesValidas = ['cachorro', 'gato', 'outro'];
    if (!especiesValidas.includes(especie)) {
      throw new Error('Espécie inválida. Use: cachorro, gato ou outro');
    }

    const portesValidos = ['pequeno', 'medio', 'grande'];
    if (!portesValidos.includes(porte)) {
      throw new Error('Porte inválido. Use: pequeno, medio ou grande');
    }

    const id = await Animal.criar({
      nome: nome.trim(),
      especie,
      raca: raca ? raca.trim() : null,
      idade: idade ? idade.trim() : null,
      porte,
      descricao: descricao ? descricao.trim() : null,
      foto_url: foto_url || null,
      usuario_id
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

  async listarDisponiveis(pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;
    return await Animal.listarDisponiveis(limite, offset);
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