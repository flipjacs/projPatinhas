const env = require('./app/config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const rotas = require('./app/routes');
const { limitadorGlobal } = require('./app/middlewares/rateLimit');
const { errorHandler, naoEncontradoHandler } = require('./app/middlewares/errorHandler');

const app = express();

// trust proxy é necessário para que req.ip funcione atrás de nginx/Cloud
// e para que express-rate-limit identifique o cliente real.
app.set('trust proxy', 1);

// ─── Logging estruturado ────────────────────────────────────
app.use(pinoHttp({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    // Não logue nada que possa vazar credenciais.
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.senha',
      'req.body.confirmarSenha',
    ],
    remove: true,
  },
}));

// ─── Segurança ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin(origem, cb) {
    // Permite ferramentas server-to-server / curl (sem Origin)
    if (!origem) return cb(null, true);
    if (env.corsOrigins.includes(origem)) return cb(null, true);
    return cb(new Error('Origem não permitida pela política de CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(limitadorGlobal);

// ─── Healthcheck ────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ dados: { servico: 'projeto-patinhas-api', status: 'ok' } });
});

// ─── Rotas ──────────────────────────────────────────────────
app.use('/api', rotas);

// ─── 404 + erro central ─────────────────────────────────────
app.use(naoEncontradoHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`API Patinhas escutando na porta ${env.PORT} (${env.NODE_ENV})`);
  });
}

module.exports = app;
