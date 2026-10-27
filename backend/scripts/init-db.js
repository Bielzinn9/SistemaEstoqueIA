// Executa database/database.sql no banco configurado no .env.
// Uso: npm run db:init   (ATENÇÃO: recria as tabelas e apaga os dados atuais)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

(async () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '..', '..', 'database', 'database.sql'),
    'utf8'
  );
  try {
    await pool.query(sql);
    console.log('Banco criado e populado com dados de teste.');
  } catch (erro) {
    console.error('Falha ao criar o banco:', erro.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
