const { Router } = require('express');
const usuarioController = require('../controllers/usuarioController');
const { exigirAuth, exigirPapel } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { idParam, paginacao } = require('../schemas/comum.schema');
const { atualizarUsuarioBody } = require('../schemas/usuario.schema');

const router = Router();

// Listar usuários: somente admin.
router.get('/',
  exigirAuth, exigirPapel('admin'),
  validar({ query: paginacao }),
  usuarioController.listar
);

router.get('/:id',
  exigirAuth,
  validar({ params: idParam }),
  usuarioController.buscarPorId
);

router.put('/:id',
  exigirAuth,
  validar({ params: idParam, body: atualizarUsuarioBody }),
  usuarioController.atualizar
);

router.delete('/:id',
  exigirAuth,
  validar({ params: idParam }),
  usuarioController.deletar
);

module.exports = router;
