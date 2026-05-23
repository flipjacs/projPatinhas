const env = require('./app/config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');

const rotas = require('./app/routes');
const { limitadorGlobal } = require('./app/middlewares/rateLimit');
const { errorHandler, naoEncontradoHandler } = require('./app/middlewares/errorHandler');
const { obterStorage } = require('./app/storage');

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

// ─── Arquivos enviados (driver local) ───────────────────────
// Quando o driver é local, servimos os arquivos diretamente do disco com
// cache imutável: os nomes são content-hashed (sha256), então o conteúdo
// nunca muda para uma mesma URL. CDNs (R2/S3) servirão isso por conta
// própria — basta apontar UPLOADS_BASE_URL para a origem do bucket.
if (env.UPLOADS_DRIVER === 'local') {
  const storage = obterStorage();
  const UM_ANO_SEGUNDOS = 60 * 60 * 24 * 365;

  // Limitamos os métodos antes do express.static: imagens públicas só
  // respondem GET/HEAD. POST/PUT/DELETE no prefixo de uploads não fazem
  // sentido e devem virar 404 imediatamente.
  app.use(env.UPLOADS_PUBLIC_PATH, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      return res.status(405).end();
    }
    return next();
  });

  app.use(
    env.UPLOADS_PUBLIC_PATH,
    express.static(storage.raizDisco(), {
      maxAge: UM_ANO_SEGUNDOS * 1000,
      immutable: true,
      // Não listar diretórios.
      index: false,
      // Negar dotfiles preventivamente.
      dotfiles: 'deny',
      fallthrough: true,
      // Apenas extensões conhecidas — defesa em profundidade contra
      // qualquer arquivo estranho que escape ao pipeline.
      extensions: false,
      setHeaders(res, caminho) {
        // Pin MIME por extensão para garantir Content-Type previsível.
        if (/\.webp$/i.test(caminho)) res.setHeader('Content-Type', 'image/webp');
        else if (/\.jpe?g$/i.test(caminho)) res.setHeader('Content-Type', 'image/jpeg');
        else if (/\.png$/i.test(caminho)) res.setHeader('Content-Type', 'image/png');

        // Imutável de verdade: o nome do arquivo é content-hashed (sha256),
        // então o byte-content nunca muda para uma mesma URL.
        res.setHeader('Cache-Control', `public, max-age=${UM_ANO_SEGUNDOS}, immutable`);

        // Endurecimento:
        //   • CORP cross-origin permite servir as imagens de outra origem
        //     (necessário quando frontend ≠ backend, ou via CDN).
        //   • nosniff impede que o browser “adivinhe” um Content-Type alternativo.
        //   • X-Content-Type-Options & X-Frame-Options barram embeds inesperados
        //     que poderiam ser usados em ataques de tipo-confusion.
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        // Tira o Set-Cookie / privacy headers — não fazem sentido em estáticos.
        res.removeHeader('Set-Cookie');
      },
    })
  );
}

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
