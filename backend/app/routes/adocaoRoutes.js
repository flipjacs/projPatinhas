const { Router } = require('express');
const adocaoController = require('../controllers/adocaoController');
const { exigirAuth } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { idParam } = require('../schemas/comum.schema');
const {
  criarAdocaoBody,
  decidirAdocaoBody,
  filtrosAdocao,
} = require('../schemas/adocao.schema');

const router = Router();

// Solicitações que EU fiz (sou o adotante).
router.get('/minhas',
  exigirAuth,
  validar({ query: filtrosAdocao }),
  adocaoController.minhas
);

// Solicitações que EU recebi (sou dono/ONG).
router.get('/recebidas',
  exigirAuth,
  validar({ query: filtrosAdocao }),
  adocaoController.recebidas
);

router.post('/',
  exigirAuth,
  validar({ body: criarAdocaoBody }),
  adocaoController.criar
);

router.get('/:id',
  exigirAuth,
  validar({ params: idParam }),
  adocaoController.buscarPorId
);

router.patch('/:id',
  exigirAuth,
  validar({ params: idParam, body: decidirAdocaoBody }),
  adocaoController.decidir
);

module.exports = router;
