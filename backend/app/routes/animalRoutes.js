const { Router } = require('express');
const animalController = require('../controllers/animalController');

const router = Router();

router.post('/', (req, res) => animalController.cadastrar(req, res));
router.get('/', (req, res) => animalController.listarDisponiveis(req, res));
router.get('/usuario/:usuario_id', (req, res) => animalController.listarPorUsuario(req, res));
router.get('/:id', (req, res) => animalController.buscarPorId(req, res));
router.put('/:id', (req, res) => animalController.atualizar(req, res));
router.delete('/:id', (req, res) => animalController.deletar(req, res));

module.exports = router;