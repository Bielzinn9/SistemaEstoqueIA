import { requisicao } from './api';

export function listarReservas({ nome = '', data = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (nome.trim()) params.set('nome', nome.trim());
  if (data) params.set('data', data);
  if (status) params.set('status', status);
  const consulta = params.toString();
  return requisicao(`/api/reservas${consulta ? `?${consulta}` : ''}`);
}

export const criarReserva = (dados) =>
  requisicao('/api/reservas', { metodo: 'POST', corpo: dados });

export const atualizarReserva = (id, dados) =>
  requisicao(`/api/reservas/${id}`, { metodo: 'PUT', corpo: dados });

export const alterarStatus = (id, status) =>
  requisicao(`/api/reservas/${id}/status`, { metodo: 'PATCH', corpo: { status } });

export const buscarConfiguracao = () => requisicao('/api/configuracao');

export const buscarDisponibilidade = (data, horario) =>
  requisicao(
    `/api/disponibilidade?data=${encodeURIComponent(data)}&horario=${encodeURIComponent(horario)}`
  );
