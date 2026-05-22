/**
 * Regras de Animal:
 *   • Apenas usuários com papel 'ong' ou 'admin' podem cadastrar animal
 *     (mantém o produto coerente: animal vem de protetor/ONG, não de
 *     adotante).
 *   • `usuario_id` SEMPRE vem do token — nunca do body.
 *   • Atualizar / deletar: só dono (ou admin).
 *   • `ong_id` opcional; quando enviado, deve pertencer ao mesmo usuário
 *     (ou o usuário deve ser admin).
 */
const Animal = require('../models/animal');
const Ong = require('../models/ong');
const {
  ErroNaoEncontrado,
  ErroProibido,
  ErroValidacao,
} = require('../errors/AppError');

function podeOperarAnimal(requisitante, animal) {
  if (!requisitante) return false;
  if (requisitante.papel === 'admin') return true;
  return Number(requisitante.id) === Number(animal.usuario_id);
}

async function validarOngDoUsuario({ ong_id, usuario_id, papel }) {
  if (ong_id === undefined || ong_id === null) return null;
  const ong = await Ong.buscarPorId(ong_id);
  if (!ong) throw new ErroValidacao('ONG informada não existe');
  if (papel !== 'admin' && Number(ong.usuario_id) !== Number(usuario_id)) {
    throw new ErroProibido('Você não pode vincular animais a uma ONG de outro usuário');
  }
  return ong.id;
}

class AnimalService {
  async cadastrar(requisitante, dados) {
    if (!['ong', 'admin'].includes(requisitante.papel)) {
      throw new ErroProibido('Apenas ONGs podem cadastrar animais');
    }
    const ong_id = await validarOngDoUsuario({
      ong_id: dados.ong_id,
      usuario_id: requisitante.id,
      papel: requisitante.papel,
    });

    const id = await Animal.criar({
      ...dados,
      ong_id: ong_id ?? null,
      usuario_id: requisitante.id,
    });
    return Animal.buscarPorId(id);
  }

  async buscarPorId(id) {
    const animal = await Animal.buscarPorId(id);
    if (!animal) throw new ErroNaoEncontrado('Animal não encontrado');
    return animal;
  }

  async listarDisponiveis({ pagina, limite, ...filtros }) {
    const offset = (pagina - 1) * limite;
    const [itens, total] = await Promise.all([
      Animal.listarDisponiveis({ limite, offset, filtros }),
      Animal.contarDisponiveis(filtros),
    ]);
    return { itens, total };
  }

  async listarPorUsuario(usuario_id) {
    return Animal.listarPorUsuario(usuario_id);
  }

  async atualizar(id, dados, requisitante) {
    const animal = await this.buscarPorId(id);
    if (!podeOperarAnimal(requisitante, animal)) throw new ErroProibido();

    if (dados.ong_id !== undefined) {
      await validarOngDoUsuario({
        ong_id: dados.ong_id,
        usuario_id: animal.usuario_id,
        papel: requisitante.papel,
      });
    }

    await Animal.atualizar(id, dados);
    return Animal.buscarPorId(id);
  }

  async softDelete(id, requisitante) {
    const animal = await this.buscarPorId(id);
    if (!podeOperarAnimal(requisitante, animal)) throw new ErroProibido();
    await Animal.softDelete(id);
  }
}

module.exports = new AnimalService();
