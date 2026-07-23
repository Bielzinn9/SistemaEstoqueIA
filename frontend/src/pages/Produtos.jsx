import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Produtos() {

  const produtoInicial = {
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
    quantidade: ""
  };

  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(produtoInicial);
  const [editando, setEditando] = useState(false);
  const [idProduto, setIdProduto] = useState(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {

      const resposta = await api.get("/produtos");

      setProdutos(resposta.data.produtos || resposta.data);

    } catch (erro) {

      console.error(erro);

      alert("Erro ao carregar produtos.");

    }
  }

  async function salvar(e) {

    e.preventDefault();

    try {

      const dados = {
        ...form,
        preco: Number(form.preco),
        quantidade: Number(form.quantidade)
      };

      if (editando) {

        await api.put(`/produtos/${idProduto}`, dados);

        alert("Produto atualizado com sucesso!");

      } else {

        await api.post("/produtos", dados);

        alert("Produto cadastrado com sucesso!");

      }

      limparFormulario();

      carregarProdutos();

    } catch (erro) {

      console.error(erro);

      alert(
        erro.response?.data?.erro ||
        "Erro ao salvar produto."
      );

    }

  }

  function editar(produto) {

    setEditando(true);

    setIdProduto(produto.id);

    setForm({
      nome: produto.nome,
      descricao: produto.descricao,
      categoria: produto.categoria,
      preco: produto.preco,
      quantidade: produto.quantidade
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }

  function limparFormulario() {

    setForm(produtoInicial);

    setEditando(false);

    setIdProduto(null);

  }

  async function excluir(id) {

    if (!window.confirm("Deseja excluir este produto?")) {
      return;
    }

    try {

      await api.delete(`/produtos/${id}`);

      alert("Produto removido com sucesso!");

      carregarProdutos();

    } catch (erro) {

      console.error(erro);

      alert(
        erro.response?.data?.erro ||
        "Erro ao excluir produto."
      );

    }

  }

  return (

    <>

      <Navbar />

      <div className="container mt-4">

        <div className="card shadow mb-4">

          <div className="card-body">

            <h3>

              {editando
                ? "Editar Produto"
                : "Cadastrar Produto"}

            </h3>

            <form onSubmit={salvar}>

              <input
                className="form-control mb-3"
                placeholder="Nome"
                value={form.nome}
                onChange={(e)=>
                  setForm({
                    ...form,
                    nome:e.target.value
                  })
                }
                required
              />

              <input
                className="form-control mb-3"
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e)=>
                  setForm({
                    ...form,
                    descricao:e.target.value
                  })
                }
              />

              <input
                className="form-control mb-3"
                placeholder="Categoria"
                value={form.categoria}
                onChange={(e)=>
                  setForm({
                    ...form,
                    categoria:e.target.value
                  })
                }
                required
              />

              <input
                type="number"
                className="form-control mb-3"
                placeholder="Preço"
                value={form.preco}
                onChange={(e)=>
                  setForm({
                    ...form,
                    preco:e.target.value
                  })
                }
                required
              />

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

              <button className="btn btn-success me-2">

                {editando
                  ? "Atualizar"
                  : "Cadastrar"}

              </button>

              {editando && (

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>

              )}

            </form>

          </div>

        </div>

        <div className="card shadow">

          <div className="card-body">

            <h3>Produtos</h3>

            <table className="table table-striped table-hover">

              <thead>

                <tr>

                  <th>ID</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Qtd</th>
                  <th>Ações</th>

                </tr>

              </thead>

              <tbody>

                {produtos.map(produto=>(

                  <tr key={produto.id}>

                    <td>{produto.id}</td>

                    <td>{produto.nome}</td>

                    <td>{produto.categoria}</td>

                    <td>

                      R$ {Number(produto.preco).toFixed(2)}

                    </td>

                    <td>{produto.quantidade}</td>

                    <td>

                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => editar(produto)}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => excluir(produto.id)}
                      >
                        Excluir
                      </button>

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

export default Produtos;