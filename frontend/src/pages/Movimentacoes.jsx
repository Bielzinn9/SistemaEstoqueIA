import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Movimentacoes() {

  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);

  const [form, setForm] = useState({
    produtoId: "",
    tipo: "ENTRADA",
    quantidade: "",
    observacao: ""
  });

  useEffect(() => {
    carregarProdutos();
    carregarMovimentacoes();
  }, []);

  async function carregarProdutos() {

    try {

      const resposta = await api.get("/produtos");

      setProdutos(resposta.data.produtos || resposta.data);

    } catch (erro) {

      console.error(erro);

    }

  }

  async function carregarMovimentacoes() {

    try {

      const resposta = await api.get("/movimentacoes");

      setMovimentacoes(resposta.data);

    } catch (erro) {

      console.error(erro);

    }

  }

  async function salvar(e) {

    e.preventDefault();

    try {

      await api.post("/estoque/movimentar", {
        produtoId: Number(form.produtoId),
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        observacao: form.observacao
      });

      alert("Movimentação realizada com sucesso!");

      setForm({
        produtoId: "",
        tipo: "ENTRADA",
        quantidade: "",
        observacao: ""
      });

      carregarProdutos();
      carregarMovimentacoes();

    } catch (erro) {

      console.error(erro);

      alert(
        erro.response?.data?.erro ||
        "Erro ao realizar movimentação."
      );

    }

  }

  return (

    <>

      <Navbar />

      <div className="container mt-4">

        <div className="card shadow mb-4">

          <div className="card-body">

            <h3>Nova Movimentação</h3>

            <form onSubmit={salvar}>

              <select
                className="form-select mb-3"
                value={form.produtoId}
                onChange={(e)=>
                  setForm({
                    ...form,
                    produtoId:e.target.value
                  })
                }
                required
              >

                <option value="">
                  Selecione um produto
                </option>

                {produtos.map(produto=>(

                  <option
                    key={produto.id}
                    value={produto.id}
                  >
                    {produto.nome}
                  </option>

                ))}

              </select>

              <select
                className="form-select mb-3"
                value={form.tipo}
                onChange={(e)=>
                  setForm({
                    ...form,
                    tipo:e.target.value
                  })
                }
              >

                <option value="ENTRADA">
                  Entrada
                </option>

                <option value="SAIDA">
                  Saída
                </option>

              </select>

              <input
                type="number"
                className="form-control mb-3"
                placeholder="Quantidade"
                value={form.quantidade}
                onChange={(e)=>
                  setForm({
                    ...form,
                    quantidade:e.target.value
                  })
                }
                required
              />

              <input
                className="form-control mb-3"
                placeholder="Observação"
                value={form.observacao}
                onChange={(e)=>
                  setForm({
                    ...form,
                    observacao:e.target.value
                  })
                }
              />

              <button className="btn btn-success">

                Salvar Movimentação

              </button>

            </form>

          </div>

        </div>

        <div className="card shadow">

          <div className="card-body">

            <h3>Histórico</h3>

            <table className="table table-striped table-hover">

              <thead>

                <tr>

                  <th>ID</th>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Usuário</th>
                  <th>Observação</th>
                  <th>Data</th>

                </tr>

              </thead>

              <tbody>

                {movimentacoes.map((mov)=>(

                  <tr key={mov.id}>

                    <td>{mov.id}</td>

                    <td>{mov.produto.nome}</td>

                    <td>

                      {mov.tipo === "ENTRADA" ? (

                        <span className="badge bg-success">

                          Entrada

                        </span>

                      ) : (

                        <span className="badge bg-danger">

                          Saída

                        </span>

                      )}

                    </td>

                    <td>{mov.quantidade}</td>

                    <td>{mov.usuario.nome}</td>

                    <td>{mov.observacao}</td>

                    <td>

                      {new Date(mov.createdAt)
                        .toLocaleString("pt-BR")}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>

  );

}

export default Movimentacoes;