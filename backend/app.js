require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usuarioRoutes = require('./app/routes/usuarioRoutes');
const animalRoutes = require('./app/routes/animalRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/animais', animalRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Doação de Animais funcionando!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});