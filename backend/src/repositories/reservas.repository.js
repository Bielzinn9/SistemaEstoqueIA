// Única camada que conhece SQL. Todas as consultas são parametrizadas ($1, $2...).
// O parâmetro "db" pode ser o pool ou um client dentro de uma transação.

const CAMPOS = `
  r.id,
  r.cliente_id,
  c.nome,
  c.telefone,
  c.email,
  to_char(r.data_reserva, 'YYYY-MM-DD') AS data_reserva,
  to_char(r.horario, 'HH24:MI')         AS horario,
  r.quantidade_pessoas,
  r.status,
  r.observacoes,
  r.criado_em,
  r.atualizado_em
`;

const BASE = `
  FROM reservas r
  JOIN clientes c ON c.id = r.cliente_id
`;

async function listar(db, { data, nome, status } = {}) {
  const condicoes = [];
  const valores = [];

  if (data) {
    valores.push(data);
    condicoes.push(`r.data_reserva = $${valores.length}`);
  }
  if (nome) {
    valores.push(nome);
    // position() evita problemas com % e _ digitados pelo usuário
    condicoes.push(
      `position(lower($${valores.length}) in lower(c.nome)) > 0`
    );
  }
  if (status) {
    valores.push(status);
    condicoes.push(`r.status = $${valores.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT ${CAMPOS} ${BASE} ${where}
     ORDER BY r.data_reserva, r.horario, r.id`,
    valores
  );
  return rows;
}

async function buscarPorId(db, id) {
  const { rows } = await db.query(
    `SELECT ${CAMPOS} ${BASE} WHERE r.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// Serializa as operações de uma mesma data: duas requisições simultâneas
// para o mesmo dia esperam uma pela outra (o lock é liberado no COMMIT).
async function travarData(db, data) {
  await db.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
    `reservas:${data}`,
  ]);
}

async function somarPessoasOcupadas(
  db,
  { data, horario, statusQueBloqueiam, ignorarReservaId = null }
) {
  const { rows } = await db.query(
    `SELECT COALESCE(SUM(quantidade_pessoas), 0)::int AS total
       FROM reservas
      WHERE data_reserva = $1
        AND horario = $2
        AND status = ANY($3)
        AND ($4::int IS NULL OR id <> $4)`,
    [data, horario, statusQueBloqueiam, ignorarReservaId]
  );
  return rows[0].total;
}

// Reaproveita o cliente quando nome + contato são exatamente os mesmos.
async function encontrarOuCriarCliente(db, { nome, telefone, email }) {
  const existente = await db.query(
    `SELECT id FROM clientes
      WHERE lower(nome) = lower($1)
        AND telefone IS NOT DISTINCT FROM $2
        AND email IS NOT DISTINCT FROM $3
      LIMIT 1`,
    [nome, telefone, email]
  );
  if (existente.rows[0]) return existente.rows[0].id;

  const novo = await db.query(
    `INSERT INTO clientes (nome, telefone, email)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [nome, telefone, email]
  );
  return novo.rows[0].id;
}

async function inserir(db, d) {
  const { rows } = await db.query(
    `INSERT INTO reservas
       (cliente_id, data_reserva, horario, quantidade_pessoas, observacoes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [d.cliente_id, d.data_reserva, d.horario, d.quantidade_pessoas, d.observacoes]
  );
  return rows[0].id;
}

async function atualizar(db, id, d) {
  await db.query(
    `UPDATE reservas
        SET cliente_id = $1,
            data_reserva = $2,
            horario = $3,
            quantidade_pessoas = $4,
            observacoes = $5,
            atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $6`,
    [d.cliente_id, d.data_reserva, d.horario, d.quantidade_pessoas, d.observacoes, id]
  );
}

async function atualizarStatus(db, id, status) {
  await db.query(
    `UPDATE reservas
        SET status = $1, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = $2`,
    [status, id]
  );
}

async function excluir(db, id) {
  const { rowCount } = await db.query('DELETE FROM reservas WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  listar,
  buscarPorId,
  travarData,
  somarPessoasOcupadas,
  encontrarOuCriarCliente,
  inserir,
  atualizar,
  atualizarStatus,
  excluir,
};
