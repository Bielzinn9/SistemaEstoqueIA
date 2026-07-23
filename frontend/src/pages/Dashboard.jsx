import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Dashboard() {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const [dados, setDados] = useState({
    totalProdutos: 0,
    totalItens: 0,
    valorEstoque: 0,
    estoqueBaixo: 0,
    totalMovimentacoes: 0,
  });

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      const resposta = await api.get("/dashboard");
      setDados(resposta.data);
    } catch (erro) {
      console.error(erro);
    }
  }

  return (
    <>
      <Navbar />

      <div className="container mt-4">

        <div className="mb-4">
          <h2>Dashboard</h2>
          <small>Bem-vindo, {usuario?.nome}</small>
        </div>

        <div className="row">

          <div className="col-md-4 mb-3">
            <div className="card shadow text-center">
              <div className="card-body">
                <h5>📦 Produtos</h5>
                <h2>{dados.totalProdutos}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow text-center">
              <div className="card-body">
                <h5>📋 Itens</h5>
                <h2>{dados.totalItens}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow text-center">
              <div className="card-body">
                <h5>💰 Valor em Estoque</h5>
                <h2>
                  R${" "}
                  {Number(dados.valorEstoque).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card shadow text-center">
              <div className="card-body">
                <h5>⚠️ Estoque Baixo</h5>
                <h2>{dados.estoqueBaixo}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card shadow text-center">
              <div className="card-body">
                <h5>🔄 Movimentações</h5>
                <h2>{dados.totalMovimentacoes}</h2>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-4">

          <Link className="btn btn-primary me-2" to="/produtos">
            Produtos
          </Link>

          <Link className="btn btn-success" to="/movimentacoes">
            Movimentações
          </Link>

        </div>

      </div>
    </>
  );
}

export default Dashboard;