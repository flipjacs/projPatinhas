const bcrypt = require('bcryptjs');
const env = require('../config/env');

async function gerarHash(senhaCrua) {
  return bcrypt.hash(senhaCrua, env.BCRYPT_ROUNDS);
}

async function conferir(senhaCrua, hash) {
  if (!senhaCrua || !hash) return false;
  return bcrypt.compare(senhaCrua, hash);
}

module.exports = { gerarHash, conferir };
