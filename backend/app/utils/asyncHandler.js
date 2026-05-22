/**
 * Adapta um handler async para propagar rejections para `next(err)`,
 * que cai no middleware central de tratamento de erros.
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
