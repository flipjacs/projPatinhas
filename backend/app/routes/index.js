const { Router } = require('express');

const router = Router();
router.use('/auth', require('./authRoutes'));
router.use('/usuarios', require('./usuarioRoutes'));
router.use('/ongs', require('./ongRoutes'));
router.use('/animais', require('./animalRoutes'));
router.use('/adocoes', require('./adocaoRoutes'));

module.exports = router;
