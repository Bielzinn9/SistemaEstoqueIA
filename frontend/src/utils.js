export const ROTULO_STATUS = {
  pendente: 'Pendente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
};

// '2026-10-30' -> '30/10/2026' (sem passar por Date, evitando erro de fuso)
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function hojeLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function gerarHorarios({ primeiro_horario, ultimo_horario, intervalo_minutos }) {
  const paraMin = (h) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };
  const lista = [];
  for (let m = paraMin(primeiro_horario); m <= paraMin(ultimo_horario); m += intervalo_minutos) {
    lista.push(
      `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    );
  }
  return lista;
}

export const CONFIG_PADRAO = {
  primeiro_horario: '11:00',
  ultimo_horario: '22:00',
  intervalo_minutos: 30,
  max_pessoas_por_reserva: 12,
  capacidade_por_horario: 40,
  dias_antecedencia_max: 90,
};
