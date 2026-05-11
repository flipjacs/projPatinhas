require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./app/routes/usuarioRoutes');
const animalRoutes = require('./app/routes/animalRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://127.0.0.1:5500', // porta do Live Server (ajuste se necessário)
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json({ limit: '1mb' }));

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/animais', animalRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Doação de Animais funcionando!' });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});