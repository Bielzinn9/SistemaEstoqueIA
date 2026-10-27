import { useEffect, useState } from 'react';
import { buscarDisponibilidade } from '../services/reservationsService';
import { gerarHorarios, hojeLocal } from '../utils';

const vazio = {
  nome: '',
  telefone: '',
  email: '',
  data_reserva: '',
  horario: '',
  quantidade_pessoas: '2',
  observacoes: '',
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação só para orientar o usuário. A API valida tudo de novo.
function validar(valores, config) {
  const erros = {};
  const quantidade = Number(valores.quantidade_pessoas);
  const telefone = valores.telefone.trim();
  const email = valores.email.trim();

  if (!valores.nome.trim()) erros.nome = 'Informe o nome do cliente.';
  if (!telefone && !email) erros.contato = 'Informe um telefone ou e-mail para contato.';
  if (telefone) {
    const digitos = telefone.replace(/\D/g, '');
    if (!/^[\d\s()+-]+$/.test(telefone) || digitos.length < 8 || digitos.length > 15) {
      erros.telefone = 'Telefone inválido. Use de 8 a 15 dígitos.';
    }
  }
  if (email && !REGEX_EMAIL.test(email)) erros.email = 'E-mail inválido.';
  if (!valores.data_reserva) erros.data_reserva = 'Escolha a data.';
  else if (valores.data_reserva < hojeLocal()) erros.data_reserva = 'A data não pode estar no passado.';
  if (!valores.horario) erros.horario = 'Escolha o horário.';
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    erros.quantidade_pessoas = 'Informe um número inteiro maior que zero.';
  } else if (quantidade > config.max_pessoas_por_reserva) {
    erros.quantidade_pessoas = `Máximo de ${config.max_pessoas_por_reserva} pessoas por reserva.`;
  }
  return erros;
}

export default function ReservationForm({ config, reserva, onSalvar, onCancelar }) {
  const editando = Boolean(reserva);
  const [valores, setValores] = useState(
    reserva
      ? {
          nome: reserva.nome,
          telefone: reserva.telefone || '',
          email: reserva.email || '',
          data_reserva: reserva.data_reserva,
          horario: reserva.horario,
          quantidade_pessoas: String(reserva.quantidade_pessoas),
          observacoes: reserva.observacoes || '',
        }
      : vazio
  );
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [disponibilidade, setDisponibilidade] = useState(null);

  const horarios = gerarHorarios(config);

  function alterar(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined, contato: undefined }));
    setErroGeral('');
  }

  // Mostra quantos lugares restam quando data e horário estão escolhidos.
  useEffect(() => {
    if (!valores.data_reserva || !valores.horario) return undefined;

    let cancelado = false;
    buscarDisponibilidade(valores.data_reserva, valores.horario)
      .then((dados) => {
        if (cancelado) return;
        // Ao editar, os lugares da própria reserva não contam como ocupados.
        const proprios =
          editando &&
          reserva.data_reserva === valores.data_reserva &&
          reserva.horario === valores.horario
            ? reserva.quantidade_pessoas
            : 0;
        setDisponibilidade(Math.min(dados.disponiveis + proprios, dados.capacidade));
      })
      .catch(() => {
        if (!cancelado) setDisponibilidade(null);
      });

    return () => {
      cancelado = true;
    };
  }, [valores.data_reserva, valores.horario, editando, reserva]);

  async function enviar(evento) {
    evento.preventDefault();
    const encontrados = validar(valores, config);
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      setErroGeral('Corrija os campos destacados.');
      return;
    }

    setEnviando(true);
    setErroGeral('');
    try {
      await onSalvar({
        nome: valores.nome.trim(),
        telefone: valores.telefone.trim(),
        email: valores.email.trim(),
        data_reserva: valores.data_reserva,
        horario: valores.horario,
        quantidade_pessoas: Number(valores.quantidade_pessoas),
        observacoes: valores.observacoes.trim(),
      });
    } catch (erro) {
      // Erros por campo vindos da API aparecem junto do campo certo.
      const porCampo = {};
      (erro.detalhes || []).forEach((d) => {
        if (d.campo) porCampo[d.campo] = d.mensagem;
      });
      setErros(porCampo);
      setErroGeral(erro.message);
    } finally {
      setEnviando(false);
    }
  }

  const dicaDisponibilidade =
    disponibilidade === null
      ? null
      : disponibilidade === 0
        ? 'Horário lotado. Escolha outro.'
        : `${disponibilidade} lugares disponíveis neste horário.`;

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="campo">
        <label htmlFor="nome">Nome do cliente *</label>
        <input
          id="nome"
          value={valores.nome}
          maxLength={120}
          onChange={(e) => alterar('nome', e.target.value)}
          aria-invalid={Boolean(erros.nome)}
          autoFocus
        />
        {erros.nome && <small className="erro-campo">{erros.nome}</small>}
      </div>

      <div className="linha-dupla">
        <div className="campo">
          <label htmlFor="telefone">Telefone</label>
          <input
            id="telefone"
            type="tel"
            placeholder="(11) 99999-0000"
            value={valores.telefone}
            onChange={(e) => alterar('telefone', e.target.value)}
            aria-invalid={Boolean(erros.telefone || erros.contato)}
          />
          {erros.telefone && <small className="erro-campo">{erros.telefone}</small>}
        </div>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="nome@email.com"
            value={valores.email}
            onChange={(e) => alterar('email', e.target.value)}
            aria-invalid={Boolean(erros.email || erros.contato)}
          />
          {erros.email && <small className="erro-campo">{erros.email}</small>}
        </div>
      </div>
      {erros.contato ? (
        <small className="erro-campo">{erros.contato}</small>
      ) : (
        <small className="dica">Informe pelo menos um meio de contato.</small>
      )}

      <div className="linha-tripla">
        <div className="campo">
          <label htmlFor="data">Data *</label>
          <input
            id="data"
            type="date"
            min={hojeLocal()}
            value={valores.data_reserva}
            onChange={(e) => alterar('data_reserva', e.target.value)}
            aria-invalid={Boolean(erros.data_reserva)}
          />
          {erros.data_reserva && <small className="erro-campo">{erros.data_reserva}</small>}
        </div>

        <div className="campo">
          <label htmlFor="horario">Horário *</label>
          <select
            id="horario"
            value={valores.horario}
            onChange={(e) => alterar('horario', e.target.value)}
            aria-invalid={Boolean(erros.horario)}
          >
            <option value="">Selecione</option>
            {horarios.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          {erros.horario && <small className="erro-campo">{erros.horario}</small>}
        </div>

        <div className="campo">
          <label htmlFor="pessoas">Pessoas *</label>
          <input
            id="pessoas"
            type="number"
            min="1"
            max={config.max_pessoas_por_reserva}
            step="1"
            value={valores.quantidade_pessoas}
            onChange={(e) => alterar('quantidade_pessoas', e.target.value)}
            aria-invalid={Boolean(erros.quantidade_pessoas)}
          />
          {erros.quantidade_pessoas && (
            <small className="erro-campo">{erros.quantidade_pessoas}</small>
          )}
        </div>
      </div>
      {dicaDisponibilidade && (
        <small className={disponibilidade === 0 ? 'erro-campo' : 'dica'} aria-live="polite">
          {dicaDisponibilidade}
        </small>
      )}

      <div className="campo">
        <label htmlFor="observacoes">Observações (opcional)</label>
        <textarea
          id="observacoes"
          rows={3}
          maxLength={500}
          placeholder="Ex.: aniversário, cadeirinha de bebê, restrição alimentar..."
          value={valores.observacoes}
          onChange={(e) => alterar('observacoes', e.target.value)}
        />
      </div>

      {erroGeral && (
        <p className="mensagem-erro" role="alert">
          {erroGeral}
        </p>
      )}

      <div className="formulario-botoes">
        <button type="button" className="botao-secundario" onClick={onCancelar} disabled={enviando}>
          Fechar
        </button>
        <button type="submit" className="botao-principal" disabled={enviando}>
          {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar reserva'}
        </button>
      </div>
    </form>
  );
}
