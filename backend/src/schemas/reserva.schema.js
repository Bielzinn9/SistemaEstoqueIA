const regras = require('../config/regras');
const {
  dataValida,
  horarioValido,
  paraMinutos,
} = require('../utils/datas');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONE = /^[\d\s()+-]+$/;

const textoOuVazio = (valor) =>
  typeof valor === 'string' ? valor.trim() : valor;

// Valida o corpo de POST /api/reservas e PUT /api/reservas/:id.
// Retorna { dados, erros }. Se erros estiver vazio, "dados" já está limpo.
function validarReserva(corpo) {
  const erros = [];
  const entrada = corpo && typeof corpo === 'object' ? corpo : {};
  const erro = (campo, mensagem) => erros.push({ campo, mensagem });

  const nome = textoOuVazio(entrada.nome);
  const telefone = textoOuVazio(entrada.telefone) || null;
  const email = textoOuVazio(entrada.email) || null;
  const data = textoOuVazio(entrada.data_reserva);
  const horario = textoOuVazio(entrada.horario);
  const observacoes = textoOuVazio(entrada.observacoes) || null;
  const quantidade = entrada.quantidade_pessoas;

  if (typeof nome !== 'string' || !nome) {
    erro('nome', 'Informe o nome do cliente.');
  } else if (nome.length > 120) {
    erro('nome', 'O nome deve ter no máximo 120 caracteres.');
  }

  if (telefone !== null && typeof telefone !== 'string') {
    erro('telefone', 'Telefone inválido.');
  }
  if (email !== null && typeof email !== 'string') {
    erro('email', 'E-mail inválido.');
  }

  if (!telefone && !email) {
    erro('contato', 'Informe um telefone ou e-mail para contato.');
  }

  if (typeof telefone === 'string') {
    const digitos = telefone.replace(/\D/g, '');
    if (
      !REGEX_TELEFONE.test(telefone) ||
      digitos.length < 8 ||
      digitos.length > 15
    ) {
      erro('telefone', 'Telefone inválido. Use de 8 a 15 dígitos.');
    }
  }

  if (typeof email === 'string') {
    if (email.length > 160 || !REGEX_EMAIL.test(email)) {
      erro('email', 'E-mail inválido.');
    }
  }

  if (typeof data !== 'string' || !data) {
    erro('data_reserva', 'Informe a data da reserva.');
  } else if (!dataValida(data)) {
    erro('data_reserva', 'Data inválida. Use o formato AAAA-MM-DD.');
  }

  if (typeof horario !== 'string' || !horario) {
    erro('horario', 'Informe o horário da reserva.');
  } else if (!horarioValido(horario)) {
    erro('horario', 'Horário inválido. Use o formato HH:MM.');
  } else {
    const minutos = paraMinutos(horario);
    const primeiro = paraMinutos(regras.primeiroHorario);
    const ultimo = paraMinutos(regras.ultimoHorario);

    if (minutos < primeiro || minutos > ultimo) {
      erro(
        'horario',
        `Fora do horário de funcionamento (${regras.primeiroHorario} às ${regras.ultimoHorario}).`
      );
    } else if ((minutos - primeiro) % regras.intervaloMinutos !== 0) {
      erro(
        'horario',
        `Escolha um horário em intervalos de ${regras.intervaloMinutos} minutos.`
      );
    }
  }

  if (
    typeof quantidade !== 'number' ||
    !Number.isInteger(quantidade) ||
    quantidade <= 0
  ) {
    erro('quantidade_pessoas', 'A quantidade de pessoas deve ser um número inteiro positivo.');
  } else if (quantidade > regras.maxPessoasPorReserva) {
    erro(
      'quantidade_pessoas',
      `Máximo de ${regras.maxPessoasPorReserva} pessoas por reserva.`
    );
  }

  if (observacoes !== null && typeof observacoes !== 'string') {
    erro('observacoes', 'Observações inválidas.');
  } else if (observacoes && observacoes.length > 500) {
    erro('observacoes', 'As observações devem ter no máximo 500 caracteres.');
  }

  return {
    erros,
    dados: {
      nome,
      telefone,
      email: email ? email.toLowerCase() : null,
      data_reserva: data,
      horario,
      quantidade_pessoas: quantidade,
      observacoes,
    },
  };
}

function validarStatus(corpo) {
  const status = corpo && typeof corpo === 'object' ? corpo.status : undefined;
  if (!regras.statusPermitidos.includes(status)) {
    return {
      erros: [
        {
          campo: 'status',
          mensagem: `Status inválido. Use: ${regras.statusPermitidos.join(', ')}.`,
        },
      ],
    };
  }
  return { erros: [], status };
}

function validarFiltros(consulta) {
  const erros = [];
  const filtros = {};

  if (consulta.data) {
    if (typeof consulta.data !== 'string' || !dataValida(consulta.data)) {
      erros.push({ campo: 'data', mensagem: 'Data inválida. Use AAAA-MM-DD.' });
    } else {
      filtros.data = consulta.data;
    }
  }

  if (consulta.nome) {
    if (typeof consulta.nome !== 'string') {
      erros.push({ campo: 'nome', mensagem: 'Nome inválido.' });
    } else if (consulta.nome.trim()) {
      filtros.nome = consulta.nome.trim().slice(0, 120);
    }
  }

  if (consulta.status) {
    if (!regras.statusPermitidos.includes(consulta.status)) {
      erros.push({ campo: 'status', mensagem: 'Status inválido.' });
    } else {
      filtros.status = consulta.status;
    }
  }

  return { erros, filtros };
}

function validarId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validarReserva, validarStatus, validarFiltros, validarId };
