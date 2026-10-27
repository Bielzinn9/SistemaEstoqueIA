// Regras de negócio do restaurante em um único lugar.
// Cada valor pode ser sobrescrito pelo .env sem mexer no código.

const numero = (valor, padrao) => {
  const convertido = Number(valor);
  return Number.isFinite(convertido) && convertido > 0 ? convertido : padrao;
};

module.exports = {
  // Fuso usado para decidir o que é "passado" e "hoje".
  fusoHorario: process.env.TZ_RESTAURANTE || 'America/Sao_Paulo',

  // Horário de funcionamento para reservas (primeiro e último horário aceitos).
  primeiroHorario: process.env.HORARIO_ABERTURA || '11:00',
  ultimoHorario: process.env.HORARIO_ULTIMA_RESERVA || '22:00',

  // Reservas só podem começar em intervalos fixos (11:00, 11:30, 12:00...).
  intervaloMinutos: numero(process.env.INTERVALO_MINUTOS, 30),

  // Limite de pessoas em UMA reserva.
  maxPessoasPorReserva: numero(process.env.MAX_PESSOAS_POR_RESERVA, 12),

  // Estratégia de capacidade: limite total de pessoas por data + horário.
  // Soma as reservas "pendente" e "confirmada"; as demais não bloqueiam.
  capacidadePorHorario: numero(process.env.CAPACIDADE_POR_HORARIO, 40),

  // Quantos dias à frente aceitamos reservas.
  diasAntecedenciaMax: numero(process.env.DIAS_ANTECEDENCIA_MAX, 90),

  statusPermitidos: ['pendente', 'confirmada', 'cancelada', 'concluida'],
  statusQueBloqueiam: ['pendente', 'confirmada'],
};
