import { useCallback, useEffect, useState } from 'react';
import ReservationFilters from '../components/ReservationFilters';
import ReservationForm from '../components/ReservationForm';
import ReservationList from '../components/ReservationList';
import {
  alterarStatus,
  atualizarReserva,
  buscarConfiguracao,
  criarReserva,
  listarReservas,
} from '../services/reservationsService';
import { CONFIG_PADRAO } from '../utils';

const FILTROS_INICIAIS = { nome: '', data: '', status: '' };

export default function ReservationsPage() {
  const [config, setConfig] = useState(CONFIG_PADRAO);
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState('');
  const [versao, setVersao] = useState(0); // muda para forçar nova consulta
  const [formulario, setFormulario] = useState(null); // null | { reserva? }
  const [ocupadoId, setOcupadoId] = useState(null);
  const [aviso, setAviso] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  // Regras do restaurante (horários, limites). Se falhar, usamos o padrão.
  useEffect(() => {
    buscarConfiguracao()
      .then(setConfig)
      .catch(() => {});
  }, []);

  // Consulta a API sempre que os filtros mudam ou que pedimos atualização.
  useEffect(() => {
    let descartada = false;

    listarReservas(filtros)
      .then((dados) => {
        if (descartada) return;
        setReservas(dados);
        setErroLista('');
      })
      .catch((erro) => {
        if (descartada) return;
        setReservas([]);
        setErroLista(erro.message);
      })
      .finally(() => {
        if (!descartada) setCarregando(false);
      });

    // Resposta antiga não pode sobrescrever uma consulta mais nova.
    return () => {
      descartada = true;
    };
  }, [filtros, versao]);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  const recarregar = useCallback(() => {
    setCarregando(true);
    setVersao((v) => v + 1);
  }, []);

  const aplicarFiltros = useCallback((novos) => {
    setCarregando(true);
    setFiltros(novos);
  }, []);

  async function salvar(dados) {
    if (formulario.reserva) {
      await atualizarReserva(formulario.reserva.id, dados);
      setAviso({ tipo: 'sucesso', texto: 'Reserva atualizada com sucesso.' });
    } else {
      await criarReserva(dados);
      setAviso({ tipo: 'sucesso', texto: 'Reserva criada com sucesso.' });
    }
    setFormulario(null);
    recarregar();
  }

  async function mudarStatus(reserva, status) {
    if (
      status === 'cancelada' &&
      !window.confirm(`Cancelar a reserva de ${reserva.nome}?`)
    ) {
      return;
    }

    setOcupadoId(reserva.id);
    try {
      await alterarStatus(reserva.id, status);
      setAviso({ tipo: 'sucesso', texto: `Reserva de ${reserva.nome}: status atualizado.` });
      recarregar();
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: erro.message });
    } finally {
      setOcupadoId(null);
    }
  }

  const temFiltro = filtros.nome || filtros.data || filtros.status;

  return (
    <>
      <header className="topo">
        <div className="marca">
          <span className="marca-icone" aria-hidden="true">🍽️</span>
          <span>
            <strong>Sabor &amp; Cia</strong>
            <small>Painel de reservas</small>
          </span>
        </div>
        <button
          type="button"
          className="botao-principal"
          onClick={() => setFormulario({})}
        >
          + Nova reserva
        </button>
      </header>

      <main className="conteudo">
        <section className="apresentacao">
          <span className="etiqueta">RESERVAS</span>
          <h1>Mesas organizadas, clientes bem recebidos.</h1>
          <p>
            Funcionamos das {config.primeiro_horario} às {config.ultimo_horario}. Cada horário
            comporta até {config.capacidade_por_horario} pessoas, em reservas de até{' '}
            {config.max_pessoas_por_reserva}.
          </p>
        </section>

        {aviso && (
          <div
            className={aviso.tipo === 'sucesso' ? 'aviso aviso-sucesso' : 'aviso aviso-erro'}
            role={aviso.tipo === 'erro' ? 'alert' : 'status'}
          >
            {aviso.texto}
          </div>
        )}

        <section className="painel">
          <ReservationFilters filtros={filtros} onChange={aplicarFiltros} />

          <div className="painel-lista" aria-busy={carregando}>
            {carregando && <p className="estado">Carregando reservas...</p>}

            {!carregando && erroLista && (
              <div className="estado estado-erro" role="alert">
                <p>{erroLista}</p>
                <button type="button" className="botao-secundario" onClick={recarregar}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!carregando && !erroLista && reservas.length === 0 && (
              <div className="estado">
                <span aria-hidden="true">📭</span>
                <h3>{temFiltro ? 'Nenhuma reserva encontrada' : 'Ainda não há reservas'}</h3>
                <p>
                  {temFiltro
                    ? 'Tente mudar ou limpar os filtros.'
                    : 'Clique em “Nova reserva” para cadastrar a primeira.'}
                </p>
              </div>
            )}

            {!carregando && !erroLista && reservas.length > 0 && (
              <>
                <p className="contagem">{reservas.length} reserva(s)</p>
                <ReservationList
                  reservas={reservas}
                  ocupadoId={ocupadoId}
                  onEditar={(reserva) => setFormulario({ reserva })}
                  onStatus={mudarStatus}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="rodape">
        <strong>Sabor &amp; Cia</strong>
        <p>Sistema de reservas · React + Express + PostgreSQL</p>
      </footer>

      {formulario && (
        <div
          className="modal-fundo"
          onMouseDown={(e) => e.target === e.currentTarget && setFormulario(null)}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
            <h2 id="titulo-modal">
              {formulario.reserva ? 'Editar reserva' : 'Nova reserva'}
            </h2>
            <ReservationForm
              config={config}
              reserva={formulario.reserva}
              onSalvar={salvar}
              onCancelar={() => setFormulario(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
