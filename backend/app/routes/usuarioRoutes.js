const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');

const router = Router();

router.post('/', (req, res) => usuarioController.cadastrar(req, res));
router.get('/', (req, res) => usuarioController.listarTodos(req, res));
router.get('/:id', (req, res) => usuarioController.buscarPorId(req, res));
router.put('/:id', (req, res) => usuarioController.atualizar(req, res));
router.delete('/:id', (req, res) => usuarioController.deletar(req, res));

module.exports = router;