-- =====================================================================
-- Sistema de Reservas para Restaurante  |  PostgreSQL
-- Estratégia de capacidade: limite de pessoas por data + horário
-- (sem tabela de mesas; ver README, seção "Decisões do projeto").
-- ATENÇÃO: este script recria as tabelas e apaga os dados existentes.
-- =====================================================================

DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

CREATE TABLE clientes (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(120) NOT NULL,
  telefone  VARCHAR(30),
  email     VARCHAR(160),
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- precisa existir pelo menos uma forma de contato
  CONSTRAINT clientes_contato_chk CHECK (telefone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE reservas (
  id                 SERIAL PRIMARY KEY,
  cliente_id         INTEGER NOT NULL REFERENCES clientes(id),
  data_reserva       DATE NOT NULL,
  horario            TIME NOT NULL,
  quantidade_pessoas INTEGER NOT NULL CHECK (quantidade_pessoas > 0),
  status             VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'concluida')),
  observacoes        TEXT,
  criado_em          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Acelera a listagem ordenada e a soma de pessoas por horário.
CREATE INDEX idx_reservas_data_horario ON reservas (data_reserva, horario);
CREATE INDEX idx_reservas_cliente ON reservas (cliente_id);

-- ---------------------------------------------------------------------
-- Dados de teste (datas relativas a hoje, para sempre ficarem no futuro)
-- ---------------------------------------------------------------------
INSERT INTO clientes (nome, telefone, email) VALUES
  ('Ana Souza',      '(11) 98888-1111', 'ana.souza@email.com'),
  ('Bruno Lima',     '(11) 97777-2222', NULL),
  ('Carla Mendes',   NULL,              'carla.mendes@email.com'),
  ('Diego Ferreira', '(21) 96666-3333', 'diego.f@email.com'),
  ('Elisa Rocha',    '(31) 95555-4444', NULL);

INSERT INTO reservas
  (cliente_id, data_reserva, horario, quantidade_pessoas, status, observacoes) VALUES
  (1, CURRENT_DATE + 1, '19:00', 4,  'confirmada', 'Aniversário, levar bolo'),
  (2, CURRENT_DATE + 1, '19:00', 6,  'pendente',   NULL),
  (3, CURRENT_DATE + 1, '20:30', 2,  'pendente',   'Mesa perto da janela'),
  (4, CURRENT_DATE + 2, '12:30', 10, 'confirmada', 'Almoço de empresa'),
  (5, CURRENT_DATE + 3, '21:00', 3,  'cancelada',  'Cliente desistiu'),
  (1, CURRENT_DATE - 5, '20:00', 2,  'concluida',  NULL);

-- ---------------------------------------------------------------------
-- Consultas de demonstração (rode no psql/DBeaver para comprovar)
-- ---------------------------------------------------------------------
-- 1) Reservas ordenadas por data e horário, com o cliente:
--    SELECT r.id, c.nome, r.data_reserva, r.horario, r.quantidade_pessoas, r.status
--      FROM reservas r JOIN clientes c ON c.id = r.cliente_id
--     ORDER BY r.data_reserva, r.horario;
-- 2) Pesquisa por nome:
--    SELECT * FROM clientes WHERE nome ILIKE '%ana%';
-- 3) Pessoas ocupando cada horário (cancelada/concluída não bloqueiam):
--    SELECT data_reserva, horario, SUM(quantidade_pessoas) AS ocupadas
--      FROM reservas WHERE status IN ('pendente','confirmada')
--     GROUP BY data_reserva, horario ORDER BY 1, 2;
-- 4) Quantidade de reservas por cliente:
--    SELECT c.nome, COUNT(r.id) FROM clientes c
--      LEFT JOIN reservas r ON r.cliente_id = c.id GROUP BY c.nome;
