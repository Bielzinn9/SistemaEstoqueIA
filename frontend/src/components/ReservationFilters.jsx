import { useEffect, useState } from 'react';
import { ROTULO_STATUS } from '../utils';

// O campo de nome espera o usuário parar de digitar antes de consultar a API.
export default function ReservationFilters({ filtros, onChange }) {
  const [nome, setNome] = useState(filtros.nome);

  useEffect(() => {
    if (nome === filtros.nome) return undefined;
    const espera = setTimeout(() => onChange({ ...filtros, nome }), 350);
    return () => clearTimeout(espera);
  }, [nome, filtros, onChange]);

  const temFiltro = filtros.nome || filtros.data || filtros.status;

  return (
    <form
      className="filtros"
      role="search"
      onSubmit={(e) => e.preventDefault()}
      aria-label="Filtros de reservas"
    >
      <div className="campo">
        <label htmlFor="filtro-nome">Cliente</label>
        <input
          id="filtro-nome"
          type="search"
          placeholder="Buscar pelo nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="filtro-data">Data</label>
        <input
          id="filtro-data"
          type="date"
          value={filtros.data}
          onChange={(e) => onChange({ ...filtros, data: e.target.value })}
        />
      </div>

      <div className="campo">
        <label htmlFor="filtro-status">Status</label>
        <select
          id="filtro-status"
          value={filtros.status}
          onChange={(e) => onChange({ ...filtros, status: e.target.value })}
        >
          <option value="">Todos</option>
          {Object.entries(ROTULO_STATUS).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="botao-secundario"
        disabled={!temFiltro && !nome}
        onClick={() => {
          setNome('');
          onChange({ nome: '', data: '', status: '' });
        }}
      >
        Limpar filtros
      </button>
    </form>
  );
}
