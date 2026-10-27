import StatusBadge from './StatusBadge';
import { formatarData } from '../utils';

// Quais ações fazem sentido para cada status atual.
const ACOES = {
  pendente: [
    { status: 'confirmada', rotulo: 'Confirmar', classe: 'acao-ok' },
    { status: 'cancelada', rotulo: 'Cancelar', classe: 'acao-perigo' },
  ],
  confirmada: [
    { status: 'concluida', rotulo: 'Concluir', classe: 'acao-ok' },
    { status: 'cancelada', rotulo: 'Cancelar', classe: 'acao-perigo' },
  ],
  cancelada: [{ status: 'pendente', rotulo: 'Reativar', classe: '' }],
  concluida: [],
};

export default function ReservationList({ reservas, ocupadoId, onEditar, onStatus }) {
  return (
    <ul className="lista-reservas">
      {reservas.map((r) => {
        const editavel = r.status === 'pendente' || r.status === 'confirmada';
        const ocupado = ocupadoId === r.id;

        return (
          <li className={`reserva reserva-${r.status}`} key={r.id}>
            <div className="reserva-quando">
              <strong>{r.horario}</strong>
              <span>{formatarData(r.data_reserva)}</span>
            </div>

            <div className="reserva-dados">
              <div className="reserva-titulo">
                <strong>{r.nome}</strong>
                <StatusBadge status={r.status} />
              </div>
              <p className="reserva-meta">
                {r.quantidade_pessoas} {r.quantidade_pessoas === 1 ? 'pessoa' : 'pessoas'}
                {r.telefone && <> · {r.telefone}</>}
                {r.email && <> · {r.email}</>}
              </p>
              {r.observacoes && <p className="reserva-obs">“{r.observacoes}”</p>}
            </div>

            <div className="reserva-acoes">
              {editavel && (
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => onEditar(r)}
                >
                  Editar
                </button>
              )}
              {ACOES[r.status].map((acao) => (
                <button
                  key={acao.status}
                  type="button"
                  className={acao.classe}
                  disabled={ocupado}
                  onClick={() => onStatus(r, acao.status)}
                >
                  {acao.rotulo}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
