const { Router } = require('express');
const animalController = require('../controllers/animalController');
const { exigirAuth } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { idParam, idUsuarioParam } = require('../schemas/comum.schema');
const {
  criarAnimalBody,
  atualizarAnimalBody,
  filtrosListagem,
} = require('../schemas/animal.schema');

const router = Router();

// Lista pública (disponíveis) com filtros.
router.get('/',
  validar({ query: filtrosListagem }),
  animalController.listarDisponiveis
);

router.get('/usuario/:usuario_id',
  validar({ params: idUsuarioParam }),
  animalController.listarPorUsuario
);

router.get('/:id',
  validar({ params: idParam }),
  animalController.buscarPorId
);

router.post('/',
  exigirAuth,
  validar({ body: criarAnimalBody }),
  animalController.cadastrar
);

router.put('/:id',
  exigirAuth,
  validar({ params: idParam, body: atualizarAnimalBody }),
  animalController.atualizar
);

router.delete('/:id',
  exigirAuth,
  validar({ params: idParam }),
  animalController.deletar
);

module.exports = router;
