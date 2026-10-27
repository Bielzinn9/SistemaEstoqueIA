require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');
const reservasRoutes = require('./routes/reservas.routes');
const { naoEncontrado, tratarErros } = require('./middlewares/erros');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : true,
  })
);
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', banco: 'ok' });
  } catch {
    res.status(503).json({ status: 'erro', banco: 'indisponível' });
  }
});

app.use('/api', reservasRoutes);

app.use(naoEncontrado);
app.use(tratarErros);

module.exports = app;
