const { Router } = require('express');
const ongController = require('../controllers/ongController');
const { exigirAuth } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { idParam, paginacao } = require('../schemas/comum.schema');
const { criarOngBody, atualizarOngBody } = require('../schemas/ong.schema');

const router = Router();

// Lista pública de ONGs (ajuda a página /ongs do front).
router.get('/',
  validar({ query: paginacao }),
  ongController.listar
);

router.get('/:id',
  validar({ params: idParam }),
  ongController.buscarPorId
);

router.post('/',
  exigirAuth,
  validar({ body: criarOngBody }),
  ongController.criar
);

router.put('/:id',
  exigirAuth,
  validar({ params: idParam, body: atualizarOngBody }),
  ongController.atualizar
);

router.delete('/:id',
  exigirAuth,
  validar({ params: idParam }),
  ongController.deletar
);

module.exports = router;
