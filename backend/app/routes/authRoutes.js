const { Router } = require('express');
const authController = require('../controllers/authController');
const { exigirAuth } = require('../middlewares/auth');
const { validar } = require('../middlewares/validate');
const { limitadorAuth } = require('../middlewares/rateLimit');
const { registrarBody, loginBody } = require('../schemas/auth.schema');

const router = Router();

router.post('/registrar',
  limitadorAuth,
  validar({ body: registrarBody }),
  authController.registrar
);

router.post('/login',
  limitadorAuth,
  validar({ body: loginBody }),
  authController.login
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/eu', exigirAuth, authController.eu);

module.exports = router;
