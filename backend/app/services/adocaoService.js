/**
 * Adoções — máquina de estados.
 *
 *   pendente  → aprovada | rejeitada | cancelada
 *   aprovada  → concluida | cancelada
 *   rejeitada → (terminal)
 *   concluida → (terminal); marca animal como indisponível
 *   cancelada → (terminal)
 *
 * Regras:
 *   • Adotante cria a solicitação; não pode adotar o próprio animal.
 *   • Só pode haver UMA solicitação ativa (pendente/aprovada) por
 *     (animal, adotante).
 *   • Decisões (aprovar/rejeitar/concluir) são feitas pelo dono do
 *     animal ou por admin.
 *   • O próprio adotante pode CANCELAR enquanto estiver pendente/aprovada.
 *   • Ao CONCLUIR, o animal vira indisponível automaticamente.
 */
const Adocao = require('../models/adocao');
const Animal = require('../models/animal');
const {
  ErroNaoEncontrado,
  ErroProibido,
  ErroValidacao,
  ErroConflito,
} = require('../errors/AppError');

const TRANSICOES = {
  pendente:  ['aprovada', 'rejeitada', 'cancelada'],
  aprovada:  ['concluida', 'cancelada'],
  rejeitada: [],
  concluida: [],
  cancelada: [],
};

function podeAdotanteCancelar(requisitante, adocao) {
  return Number(requisitante.id) === Number(adocao.adotante_id);
}

function podeDonoDecidir(requisitante, adocao) {
  if (requisitante.papel === 'admin') return true;
  return Number(requisitante.id) === Number(adocao.dono_id);
}

class AdocaoService {
  async criar(requisitante, { animal_id, mensagem }) {
    const animal = await Animal.buscarPorId(animal_id);
    if (!animal) throw new ErroNaoEncontrado('Animal não encontrado');

    if (Number(animal.usuario_id) === Number(requisitante.id)) {
      throw new ErroProibido('Você não pode solicitar adoção do seu próprio animal');
    }
    if (!animal.disponivel) {
      throw new ErroConflito('Este animal não está disponível para adoção');
    }
    const jaExiste = await Adocao.existeAtivaParaAnimalDoAdotante({
      animal_id,
      adotante_id: requisitante.id,
    });
    if (jaExiste) {
      throw new ErroConflito('Você já tem uma solicitação ativa para este animal');
    }

    const id = await Adocao.criar({
      animal_id,
      adotante_id: requisitante.id,
      mensagem,
    });
    return Adocao.buscarPorId(id);
  }

  async buscarPorId(id) {
    const adocao = await Adocao.buscarPorId(id);
    if (!adocao) throw new ErroNaoEncontrado('Adoção não encontrada');
    return adocao;
  }

  async minhasSolicitacoes({ adotante_id, pagina, limite, status }) {
    const offset = (pagina - 1) * limite;
    const [itens, total] = await Promise.all([
      Adocao.listarPorAdotante({ adotante_id, status, limite, offset }),
      Adocao.contarPorAdotante({ adotante_id, status }),
    ]);
    return { itens, total };
  }

  async recebidas({ dono_id, pagina, limite, status }) {
    const offset = (pagina - 1) * limite;
    const [itens, total] = await Promise.all([
      Adocao.listarPorDono({ dono_id, status, limite, offset }),
      Adocao.contarPorDono({ dono_id, status }),
    ]);
    return { itens, total };
  }

  async decidir(id, requisitante, { status, resposta }) {
    const adocao = await this.buscarPorId(id);

    const transicoesValidas = TRANSICOES[adocao.status];
    if (!transicoesValidas.includes(status)) {
      throw new ErroValidacao(
        `Transição inválida: '${adocao.status}' → '${status}'`
      );
    }

    if (status === 'cancelada') {
      const ok = podeAdotanteCancelar(requisitante, adocao)
        || podeDonoDecidir(requisitante, adocao);
      if (!ok) throw new ErroProibido();
    } else {
      if (!podeDonoDecidir(requisitante, adocao)) throw new ErroProibido();
    }

    await Adocao.atualizarStatus(id, { status, resposta });

    if (status === 'concluida') {
      await Animal.atualizar(adocao.animal_id, { disponivel: false });
    }

    return Adocao.buscarPorId(id);
  }
}

module.exports = new AdocaoService();
module.exports.TRANSICOES = TRANSICOES;
