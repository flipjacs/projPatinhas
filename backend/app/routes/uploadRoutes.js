const { Router } = require('express');

const uploadController = require('../controllers/uploadController');
const { exigirAuth } = require('../middlewares/auth');
const { aceitarArquivo } = require('../middlewares/uploadMiddleware');
const { validar } = require('../middlewares/validate');
const { limitadorUpload } = require('../middlewares/rateLimit');
const { idParam } = require('../schemas/comum.schema');
const { criarUploadBody } = require('../schemas/upload.schema');

const router = Router();

// POST /api/uploads — multipart com campo "arquivo".
// O body acompanha "tipo" (avatar | animal | ong).
//
// Ordem dos middlewares importa:
//   1. exigirAuth (sem auth, nada de upload; o limitador também usa req.usuario.id)
//   2. limitadorUpload (corta floods antes de gastar disco/CPU com multer+sharp)
//   3. aceitarArquivo (multer popula req.file + req.body)
//   4. validar (Zod inspeciona req.body)
//   5. controller
router.post('/',
  exigirAuth,
  limitadorUpload,
  ...aceitarArquivo('arquivo'),
  validar({ body: criarUploadBody }),
  uploadController.criar
);

router.get('/:id',
  validar({ params: idParam }),
  uploadController.buscarPorId
);

router.delete('/:id',
  exigirAuth,
  validar({ params: idParam }),
  uploadController.remover
);

module.exports = router;
