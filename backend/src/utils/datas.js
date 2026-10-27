const { fusoHorario } = require('../config/regras');

// "Agora" no fuso do restaurante, como strings comparáveis.
function agoraNoRestaurante(referencia = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: fusoHorario,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(referencia)
    .reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    horario: `${partes.hour}:${partes.minute}`,
  };
}

// Confere formato E existência (rejeita 2026-02-31).
function dataValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split('-').map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    d.getUTCFullYear() === ano &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia
  );
}

function horarioValido(texto) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(texto);
}

const paraMinutos = (horario) => {
  const [h, m] = horario.split(':').map(Number);
  return h * 60 + m;
};

function somarDias(data, dias) {
  const [a, m, d] = data.split('-').map(Number);
  const nova = new Date(Date.UTC(a, m - 1, d + dias));
  return nova.toISOString().slice(0, 10);
}

module.exports = {
  agoraNoRestaurante,
  dataValida,
  horarioValido,
  paraMinutos,
  somarDias,
};
