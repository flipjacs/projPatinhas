const animalService = require('../services/animalService');

class AnimalController {
  async cadastrar(req, res) {
    try {
      const { nome, especie, raca, idade, porte, descricao, foto_url, usuario_id } = req.body;

      if (!nome || !especie || !porte || !usuario_id) {
        return res.status(400).json({ erro: 'Nome, espécie, porte e usuário são obrigatórios' });
      }

      const animal = await animalService.cadastrar({
        nome, especie, raca, idade, porte, descricao, foto_url, usuario_id
      });
      return res.status(201).json(animal);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      if (error.message.includes('inválid')) {
        return res.status(400).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const animal = await animalService.buscarPorId(id);
      return res.json(animal);
    } catch (error) {
      if (error.message === 'Animal não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async listarDisponiveis(req, res) {
    try {
      const pagina = Math.max(1, Number(req.query.pagina) || 1);
      const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 20));

      const animais = await animalService.listarDisponiveis(pagina, limite);
      return res.json(animais);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async listarPorUsuario(req, res) {
    try {
      const usuario_id = Number(req.params.usuario_id);
      if (!usuario_id || usuario_id <= 0) {
        return res.status(400).json({ erro: 'ID de usuário inválido' });
      }

      const animais = await animalService.listarPorUsuario(usuario_id);
      return res.json(animais);
    } catch (error) {
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async atualizar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      const animal = await animalService.atualizar(id, req.body);
      return res.json(animal);
    } catch (error) {
      if (error.message === 'Animal não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) {
        return res.status(400).json({ erro: 'ID inválido' });
      }

      await animalService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Animal não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AnimalController();