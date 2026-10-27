// Traduz HTTP <-> serviço. Sem SQL e sem regra de negócio aqui.

const service = require('../services/reservas.service');
const regras = require('../config/regras');
const AppError = require('../utils/AppError');
const {
  validarReserva,
  validarStatus,
  validarFiltros,
  validarId,
} = require('../schemas/reserva.schema');
const { dataValida, horarioValido } = require('../utils/datas');

function idDaRota(req) {
  const id = validarId(req.params.id);
  if (!id) throw new AppError(400, 'ID inválido.');
  return id;
}

function exigirValido(erros) {
  if (erros.length) throw new AppError(400, 'Dados inválidos.', erros);
}

async function listar(req, res) {
  const { erros, filtros } = validarFiltros(req.query);
  exigirValido(erros);
  res.json(await service.listar(filtros));
}

async function obter(req, res) {
  res.json(await service.obter(idDaRota(req)));
}

async function criar(req, res) {
  const { erros, dados } = validarReserva(req.body);
  exigirValido(erros);
  res.status(201).json(await service.criar(dados));
}

async function atualizar(req, res) {
  const id = idDaRota(req);
  const { erros, dados } = validarReserva(req.body);
  exigirValido(erros);
  res.json(await service.atualizar(id, dados));
}

async function mudarStatus(req, res) {
  const id = idDaRota(req);
  const { erros, status } = validarStatus(req.body);
  exigirValido(erros);
  res.json(await service.mudarStatus(id, status));
}

async function excluir(req, res) {
  await service.excluir(idDaRota(req));
  res.status(204).end();
}

async function disponibilidade(req, res) {
  const { data, horario } = req.query;
  if (!dataValida(data || '') || !horarioValido(horario || '')) {
    throw new AppError(400, 'Informe data (AAAA-MM-DD) e horario (HH:MM).');
  }
  res.json(await service.consultarDisponibilidade(data, horario));
}

function configuracao(req, res) {
  res.json({
    primeiro_horario: regras.primeiroHorario,
    ultimo_horario: regras.ultimoHorario,
    intervalo_minutos: regras.intervaloMinutos,
    max_pessoas_por_reserva: regras.maxPessoasPorReserva,
    capacidade_por_horario: regras.capacidadePorHorario,
    dias_antecedencia_max: regras.diasAntecedenciaMax,
    status: regras.statusPermitidos,
  });
}

module.exports = {
  listar,
  obter,
  criar,
  atualizar,
  mudarStatus,
  excluir,
  disponibilidade,
  configuracao,
};
