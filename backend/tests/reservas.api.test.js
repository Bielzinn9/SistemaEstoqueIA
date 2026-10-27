// Testes de integração: sobem a API de verdade e chamam os endpoints por HTTP.
//
// Usam um banco SEPARADO (reservas_restaurante_test) porque recriam as tabelas.
//   1) createdb reservas_restaurante_test
//   2) npm test
// Para outro nome: DB_NAME_TEST=meu_banco npm test

process.env.DB_NAME = process.env.DB_NAME_TEST || 'reservas_restaurante_test';
delete process.env.DATABASE_URL;

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');
const { pool } = require('../src/config/database');
const { agoraNoRestaurante, somarDias } = require('../src/utils/datas');

let servidor;
let base;

const hoje = agoraNoRestaurante().data;
// Usamos dias distantes dos dados de teste (que ficam entre hoje+1 e hoje+3).
const dia = (n) => somarDias(hoje, n);

async function chamar(metodo, rota, corpo) {
  const resposta = await fetch(`${base}${rota}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const texto = await resposta.text();
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null };
}

const valida = (extra = {}) => ({
  nome: 'Teste Silva',
  telefone: '(11) 91234-5678',
  email: 'teste@email.com',
  data_reserva: dia(10),
  horario: '19:00',
  quantidade_pessoas: 4,
  observacoes: 'Sem glúten',
  ...extra,
});

before(async () => {
  const sql = fs.readFileSync(
    path.join(__dirname, '..', '..', 'database', 'database.sql'),
    'utf8'
  );
  await pool.query(sql);
  await new Promise((ok) => {
    servidor = app.listen(0, ok);
  });
  base = `http://127.0.0.1:${servidor.address().port}`;
});

after(async () => {
  servidor.close();
  await pool.end();
});

describe('infraestrutura', () => {
  test('GET /api/health informa que API e banco estão ativos', async () => {
    const r = await chamar('GET', '/api/health');
    assert.equal(r.status, 200);
    assert.equal(r.corpo.banco, 'ok');
  });

  test('rota inexistente retorna 404 em JSON', async () => {
    const r = await chamar('GET', '/api/nada');
    assert.equal(r.status, 404);
    assert.ok(r.corpo.erro);
  });

  test('JSON malformado retorna 400 sem vazar detalhes internos', async () => {
    const resposta = await fetch(`${base}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ nome: ',
    });
    assert.equal(resposta.status, 400);
    const corpo = await resposta.json();
    assert.match(corpo.erro, /JSON/);
  });
});

describe('criar reserva', () => {
  test('dados válidos: 201 e aparece na listagem', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ horario: '11:00' }));
    assert.equal(criada.status, 201);
    assert.equal(criada.corpo.status, 'pendente');
    assert.equal(criada.corpo.data_reserva, dia(10));
    assert.equal(criada.corpo.horario, '11:00');

    const lista = await chamar('GET', `/api/reservas?data=${dia(10)}`);
    assert.ok(lista.corpo.some((r) => r.id === criada.corpo.id));
  });

  test('nome vazio é rejeitado com mensagem clara', async () => {
    const r = await chamar('POST', '/api/reservas', valida({ nome: '   ' }));
    assert.equal(r.status, 400);
    assert.ok(r.corpo.detalhes.some((d) => d.campo === 'nome'));
  });

  test('data vazia ou inexistente é rejeitada', async () => {
    for (const data_reserva of ['', undefined, '2026-02-31', '10/10/2026']) {
      const r = await chamar('POST', '/api/reservas', valida({ data_reserva }));
      assert.equal(r.status, 400, `data ${data_reserva}`);
    }
  });

  test('quantidade zero, negativa, decimal, texto ou acima do limite é rejeitada', async () => {
    for (const quantidade_pessoas of [0, -3, 2.5, '4', null, 13]) {
      const r = await chamar('POST', '/api/reservas', valida({ quantidade_pessoas }));
      assert.equal(r.status, 400, `quantidade ${quantidade_pessoas}`);
    }
  });

  test('data e horário no passado são rejeitados', async () => {
    const ontem = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(-1) }));
    assert.equal(ontem.status, 400);

    const agora = agoraNoRestaurante();
    const passadoHoje = await chamar(
      'POST',
      '/api/reservas',
      valida({ data_reserva: agora.data, horario: '11:00' })
    );
    // Se o teste rodar antes das 11:00, esse horário ainda é futuro: só conferimos quando já passou.
    if (agora.horario >= '11:00') assert.equal(passadoHoje.status, 400);
  });

  test('fora do horário de funcionamento ou fora do intervalo é rejeitado', async () => {
    for (const horario of ['10:30', '22:30', '23:00', '12:15', '25:00', 'abc']) {
      const r = await chamar('POST', '/api/reservas', valida({ horario }));
      assert.equal(r.status, 400, `horário ${horario}`);
    }
  });

  test('exige telefone ou e-mail e valida o formato', async () => {
    const sem = await chamar('POST', '/api/reservas', valida({ telefone: '', email: '' }));
    assert.equal(sem.status, 400);

    const emailRuim = await chamar('POST', '/api/reservas', valida({ email: 'sem-arroba' }));
    assert.equal(emailRuim.status, 400);

    const telRuim = await chamar('POST', '/api/reservas', valida({ telefone: 'abc123' }));
    assert.equal(telRuim.status, 400);

    const soEmail = await chamar(
      'POST',
      '/api/reservas',
      valida({ telefone: '', horario: '11:30' })
    );
    assert.equal(soEmail.status, 201);
  });

  test('SQL injection no nome é tratado como texto comum', async () => {
    const nome = "Robert'); DROP TABLE reservas;--";
    const r = await chamar('POST', '/api/reservas', valida({ nome, horario: '12:00' }));
    assert.equal(r.status, 201);
    assert.equal(r.corpo.nome, nome);
    const lista = await chamar('GET', '/api/reservas');
    assert.equal(lista.status, 200);
  });
});

describe('disponibilidade e conflitos', () => {
  const data = dia(20);

  test('soma de pessoas no mesmo horário respeita a capacidade (40)', async () => {
    const corpo = valida({ data_reserva: data, horario: '20:00', quantidade_pessoas: 12 });
    for (let i = 0; i < 3; i++) {
      const r = await chamar('POST', '/api/reservas', corpo);
      assert.equal(r.status, 201); // 12 + 12 + 12 = 36
    }

    const estoura = await chamar('POST', '/api/reservas', corpo);
    assert.equal(estoura.status, 409);
    assert.match(estoura.corpo.erro, /4 lugares/);

    const cabe = await chamar('POST', '/api/reservas', { ...corpo, quantidade_pessoas: 4 });
    assert.equal(cabe.status, 201); // 36 + 4 = 40

    const lotado = await chamar('POST', '/api/reservas', { ...corpo, quantidade_pessoas: 1 });
    assert.equal(lotado.status, 409);
    assert.match(lotado.corpo.erro, /lotado/i);

    // A reserva recusada NÃO foi gravada.
    const lista = await chamar('GET', `/api/reservas?data=${data}`);
    assert.equal(lista.corpo.length, 4);

    const disp = await chamar('GET', `/api/disponibilidade?data=${data}&horario=20:00`);
    assert.equal(disp.corpo.disponiveis, 0);

    // Outro horário do mesmo dia continua livre.
    const outro = await chamar('POST', '/api/reservas', { ...corpo, horario: '20:30' });
    assert.equal(outro.status, 201);
  });

  test('requisições simultâneas não estouram a capacidade', async () => {
    const corpo = valida({ data_reserva: dia(21), horario: '19:30', quantidade_pessoas: 12 });
    const respostas = await Promise.all(
      Array.from({ length: 6 }, () => chamar('POST', '/api/reservas', corpo))
    );
    const aceitas = respostas.filter((r) => r.status === 201).length;
    const recusadas = respostas.filter((r) => r.status === 409).length;
    assert.equal(aceitas, 3); // 3 x 12 = 36; a quarta passaria de 40
    assert.equal(recusadas, 3);
  });

  test('cancelar libera a vaga; reativar sem espaço dá 409', async () => {
    const dataTeste = dia(22);
    const corpo = valida({ data_reserva: dataTeste, horario: '21:00', quantidade_pessoas: 12 });
    const ids = [];
    for (let i = 0; i < 3; i++) {
      ids.push((await chamar('POST', '/api/reservas', corpo)).corpo.id);
    }
    const bloqueada = await chamar('POST', '/api/reservas', corpo);
    assert.equal(bloqueada.status, 409);

    const cancelada = await chamar('PATCH', `/api/reservas/${ids[0]}/status`, {
      status: 'cancelada',
    });
    assert.equal(cancelada.status, 200);
    assert.equal(cancelada.corpo.status, 'cancelada');

    const agoraCabe = await chamar('POST', '/api/reservas', corpo);
    assert.equal(agoraCabe.status, 201);

    const reativar = await chamar('PATCH', `/api/reservas/${ids[0]}/status`, {
      status: 'confirmada',
    });
    assert.equal(reativar.status, 409);
  });
});

describe('pesquisa e ordenação', () => {
  test('filtra por nome (sem diferenciar maiúsculas) e por data', async () => {
    await chamar('POST', '/api/reservas', valida({ nome: 'Zulmira Pesquisável', data_reserva: dia(30), horario: '13:00' }));

    const porNome = await chamar('GET', '/api/reservas?nome=zulmira');
    assert.equal(porNome.status, 200);
    assert.ok(porNome.corpo.length >= 1);
    assert.ok(porNome.corpo.every((r) => /zulmira/i.test(r.nome)));

    const porData = await chamar('GET', `/api/reservas?data=${dia(30)}`);
    assert.ok(porData.corpo.every((r) => r.data_reserva === dia(30)));

    const nenhum = await chamar('GET', '/api/reservas?nome=ninguem-com-esse-nome');
    assert.deepEqual(nenhum.corpo, []);

    const coringa = await chamar('GET', '/api/reservas?nome=%25');
    assert.deepEqual(coringa.corpo, []); // % é tratado como texto, não como curinga
  });

  test('filtra por status e rejeita filtros inválidos', async () => {
    const canceladas = await chamar('GET', '/api/reservas?status=cancelada');
    assert.ok(canceladas.corpo.every((r) => r.status === 'cancelada'));

    assert.equal((await chamar('GET', '/api/reservas?status=xpto')).status, 400);
    assert.equal((await chamar('GET', '/api/reservas?data=ontem')).status, 400);
  });

  test('lista ordenada por data e horário', async () => {
    const { corpo } = await chamar('GET', '/api/reservas');
    const chaves = corpo.map((r) => `${r.data_reserva} ${r.horario}`);
    assert.deepEqual(chaves, [...chaves].sort());
  });
});

describe('editar reserva', () => {
  test('PUT atualiza os dados', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(40), horario: '12:00' }));
    const id = criada.corpo.id;

    const r = await chamar('PUT', `/api/reservas/${id}`, valida({
      data_reserva: dia(41),
      horario: '13:30',
      quantidade_pessoas: 6,
      nome: 'Nome Alterado',
    }));
    assert.equal(r.status, 200);
    assert.equal(r.corpo.nome, 'Nome Alterado');
    assert.equal(r.corpo.data_reserva, dia(41));
    assert.equal(r.corpo.horario, '13:30');
    assert.equal(r.corpo.quantidade_pessoas, 6);

    const relida = await chamar('GET', `/api/reservas/${id}`);
    assert.equal(relida.corpo.nome, 'Nome Alterado');
  });

  test('editar revalida a disponibilidade, ignorando a própria reserva', async () => {
    const data = dia(45);
    const cheia = valida({ data_reserva: data, horario: '18:00', quantidade_pessoas: 12 });
    await chamar('POST', '/api/reservas', cheia);
    await chamar('POST', '/api/reservas', cheia);
    const terceira = await chamar('POST', '/api/reservas', { ...cheia, quantidade_pessoas: 4 }); // total 28

    // Aumentar a própria reserva de 4 para 12 => 36, cabe.
    const ok = await chamar('PUT', `/api/reservas/${terceira.corpo.id}`, { ...cheia, quantidade_pessoas: 12 });
    assert.equal(ok.status, 200);

    // Mover outra reserva para um horário já cheio => 409.
    const outra = await chamar('POST', '/api/reservas', { ...cheia, horario: '18:30', quantidade_pessoas: 12 });
    const quatroMais = await chamar('POST', '/api/reservas', { ...cheia, quantidade_pessoas: 4 });
    assert.equal(quatroMais.status, 201); // 36 + 4 = 40: lotado
    const conflito = await chamar('PUT', `/api/reservas/${outra.corpo.id}`, { ...cheia, quantidade_pessoas: 12 });
    assert.equal(conflito.status, 409);
  });

  test('reserva inexistente: 404 em GET, PUT, PATCH e DELETE', async () => {
    assert.equal((await chamar('GET', '/api/reservas/999999')).status, 404);
    assert.equal((await chamar('PUT', '/api/reservas/999999', valida())).status, 404);
    assert.equal((await chamar('PATCH', '/api/reservas/999999/status', { status: 'confirmada' })).status, 404);
    assert.equal((await chamar('DELETE', '/api/reservas/999999')).status, 404);
  });

  test('id inválido: 400', async () => {
    assert.equal((await chamar('GET', '/api/reservas/abc')).status, 400);
    assert.equal((await chamar('PUT', '/api/reservas/0', valida())).status, 400);
  });

  test('não permite editar reserva cancelada ou concluída', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(50), horario: '14:00' }));
    await chamar('PATCH', `/api/reservas/${criada.corpo.id}/status`, { status: 'cancelada' });
    const r = await chamar('PUT', `/api/reservas/${criada.corpo.id}`, valida({ data_reserva: dia(50), horario: '14:00' }));
    assert.equal(r.status, 409);
  });
});

describe('status e exclusão', () => {
  test('fluxo pendente -> confirmada -> concluida', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(55), horario: '15:00' }));
    const id = criada.corpo.id;
    for (const status of ['confirmada', 'concluida']) {
      const r = await chamar('PATCH', `/api/reservas/${id}/status`, { status });
      assert.equal(r.status, 200);
      assert.equal(r.corpo.status, status);
    }
  });

  test('status inválido ou ausente: 400', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(56), horario: '15:00' }));
    const id = criada.corpo.id;
    assert.equal((await chamar('PATCH', `/api/reservas/${id}/status`, { status: 'xpto' })).status, 400);
    assert.equal((await chamar('PATCH', `/api/reservas/${id}/status`, {})).status, 400);
  });

  test('DELETE remove a reserva', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(57), horario: '15:00' }));
    assert.equal((await chamar('DELETE', `/api/reservas/${criada.corpo.id}`)).status, 204);
    assert.equal((await chamar('GET', `/api/reservas/${criada.corpo.id}`)).status, 404);
  });

  test('atualizado_em muda quando o status muda', async () => {
    const criada = await chamar('POST', '/api/reservas', valida({ data_reserva: dia(58), horario: '15:00' }));
    await new Promise((ok) => setTimeout(ok, 20));
    const r = await chamar('PATCH', `/api/reservas/${criada.corpo.id}/status`, { status: 'confirmada' });
    assert.ok(new Date(r.corpo.atualizado_em) > new Date(criada.corpo.atualizado_em));
  });
});

describe('configuração', () => {
  test('GET /api/configuracao expõe as regras para o frontend', async () => {
    const r = await chamar('GET', '/api/configuracao');
    assert.equal(r.status, 200);
    assert.equal(r.corpo.capacidade_por_horario, 40);
    assert.equal(r.corpo.max_pessoas_por_reserva, 12);
  });
});
