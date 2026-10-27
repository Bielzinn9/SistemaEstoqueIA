// Regras de negócio. Aqui decidimos se uma reserva pode ou não existir.

const { pool, comTransacao } = require('../config/database');
const regras = require('../config/regras');
const repo = require('../repositories/reservas.repository');
const AppError = require('../utils/AppError');
const {
  agoraNoRestaurante,
  somarDias,
} = require('../utils/datas');

function garantirDataHorarioFuturos(data, horario) {
  const agora = agoraNoRestaurante();

  if (data < agora.data || (data === agora.data && horario <= agora.horario)) {
    throw new AppError(400, 'Não é possível reservar para uma data/horário que já passou.', [
      { campo: 'data_reserva', mensagem: 'Escolha uma data e horário futuros.' },
    ]);
  }

  if (data > somarDias(agora.data, regras.diasAntecedenciaMax)) {
    throw new AppError(
      400,
      `Só aceitamos reservas com até ${regras.diasAntecedenciaMax} dias de antecedência.`,
      [{ campo: 'data_reserva', mensagem: 'Data muito distante.' }]
    );
  }
}

// Regra de capacidade: soma de pessoas (pendente + confirmada) no mesmo
// dia e horário, mais esta reserva, não pode passar do limite.
async function garantirDisponibilidade(db, { data, horario, pessoas, ignorarReservaId }) {
  const ocupadas = await repo.somarPessoasOcupadas(db, {
    data,
    horario,
    statusQueBloqueiam: regras.statusQueBloqueiam,
    ignorarReservaId,
  });
  const livres = regras.capacidadePorHorario - ocupadas;

  if (pessoas > livres) {
    throw new AppError(
      409,
      livres > 0
        ? `Horário indisponível para ${pessoas} pessoas. Restam ${livres} lugares neste horário.`
        : 'Horário lotado. Escolha outro horário.',
      [{ campo: 'horario', mensagem: 'Sem disponibilidade.' }]
    );
  }
}

async function listar(filtros) {
  return repo.listar(pool, filtros);
}

async function obter(id) {
  const reserva = await repo.buscarPorId(pool, id);
  if (!reserva) throw new AppError(404, 'Reserva não encontrada.');
  return reserva;
}

async function consultarDisponibilidade(data, horario) {
  const ocupadas = await repo.somarPessoasOcupadas(pool, {
    data,
    horario,
    statusQueBloqueiam: regras.statusQueBloqueiam,
  });
  return {
    data_reserva: data,
    horario,
    capacidade: regras.capacidadePorHorario,
    ocupadas,
    disponiveis: Math.max(regras.capacidadePorHorario - ocupadas, 0),
  };
}

async function criar(dados) {
  garantirDataHorarioFuturos(dados.data_reserva, dados.horario);

  return comTransacao(async (db) => {
    await repo.travarData(db, dados.data_reserva);

    await garantirDisponibilidade(db, {
      data: dados.data_reserva,
      horario: dados.horario,
      pessoas: dados.quantidade_pessoas,
    });

    const clienteId = await repo.encontrarOuCriarCliente(db, dados);
    const id = await repo.inserir(db, { ...dados, cliente_id: clienteId });
    return repo.buscarPorId(db, id);
  });
}

async function atualizar(id, dados) {
  return comTransacao(async (db) => {
    const atual = await repo.buscarPorId(db, id);
    if (!atual) throw new AppError(404, 'Reserva não encontrada.');

    if (!regras.statusQueBloqueiam.includes(atual.status)) {
      throw new AppError(
        409,
        `Não é possível editar uma reserva ${atual.status}.`
      );
    }

    const mudouAgenda =
      atual.data_reserva !== dados.data_reserva ||
      atual.horario !== dados.horario;
    if (mudouAgenda) {
      garantirDataHorarioFuturos(dados.data_reserva, dados.horario);
    }

    // Trava as duas datas (em ordem fixa, para evitar deadlock).
    const datas = [...new Set([atual.data_reserva, dados.data_reserva])].sort();
    for (const data of datas) await repo.travarData(db, data);

    // Qualquer edição de data, horário ou pessoas revalida a disponibilidade.
    await garantirDisponibilidade(db, {
      data: dados.data_reserva,
      horario: dados.horario,
      pessoas: dados.quantidade_pessoas,
      ignorarReservaId: id,
    });

    const clienteId = await repo.encontrarOuCriarCliente(db, dados);
    await repo.atualizar(db, id, { ...dados, cliente_id: clienteId });
    return repo.buscarPorId(db, id);
  });
}

async function mudarStatus(id, novoStatus) {
  return comTransacao(async (db) => {
    const atual = await repo.buscarPorId(db, id);
    if (!atual) throw new AppError(404, 'Reserva não encontrada.');

    if (atual.status === novoStatus) return atual;

    const voltaABloquear =
      !regras.statusQueBloqueiam.includes(atual.status) &&
      regras.statusQueBloqueiam.includes(novoStatus);

    // Reativar uma reserva cancelada/concluída ocupa lugares de novo.
    if (voltaABloquear) {
      garantirDataHorarioFuturos(atual.data_reserva, atual.horario);
      await repo.travarData(db, atual.data_reserva);
      await garantirDisponibilidade(db, {
        data: atual.data_reserva,
        horario: atual.horario,
        pessoas: atual.quantidade_pessoas,
        ignorarReservaId: id,
      });
    }

    await repo.atualizarStatus(db, id, novoStatus);
    return repo.buscarPorId(db, id);
  });
}

async function excluir(id) {
  const removida = await repo.excluir(pool, id);
  if (!removida) throw new AppError(404, 'Reserva não encontrada.');
}

module.exports = {
  listar,
  obter,
  consultarDisponibilidade,
  criar,
  atualizar,
  mudarStatus,
  excluir,
};
