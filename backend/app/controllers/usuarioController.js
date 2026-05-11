const usuarioService = require('../services/usuarioService');

class UsuarioController {
  async cadastrar(req, res) {
    try {
      const { nome, email, senha, telefone, cidade, estado } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
      }

      const usuario = await usuarioService.cadastrar({ nome, email, senha, telefone, cidade, estado });
      return res.status(201).json(usuario);
    } catch (error) {
      if (error.message === 'E-mail já cadastrado') {
        return res.status(409).json({ erro: error.message });
      }
      if (error.message === 'Formato de e-mail inválido' || error.message === 'A senha deve ter no mínimo 6 caracteres') {
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

      const usuario = await usuarioService.buscarPorId(id);
      return res.json(usuario);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }

  async listarTodos(req, res) {
    try {
      const pagina = Math.max(1, Number(req.query.pagina) || 1);
      const limite = Math.min(50, Math.max(1, Number(req.query.limite) || 20));

      const usuarios = await usuarioService.listarTodos(pagina, limite);
      return res.json(usuarios);
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

      const usuario = await usuarioService.atualizar(id, req.body);
      return res.json(usuario);
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
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

      await usuarioService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ erro: error.message });
      }
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UsuarioController();