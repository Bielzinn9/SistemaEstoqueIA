const { Pool } = require('pg');

// Credenciais vêm somente do .env (nunca ficam no código).
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'reservas_restaurante',
      }
);

// Executa uma função dentro de uma transação (BEGIN ... COMMIT/ROLLBACK).
async function comTransacao(funcao) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const resultado = await funcao(client);
    await client.query('COMMIT');
    return resultado;
  } catch (erro) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // se o rollback falhar, o erro original é o que importa
    }
    throw erro;
  } finally {
    client.release();
  }
}

module.exports = { pool, comTransacao };
