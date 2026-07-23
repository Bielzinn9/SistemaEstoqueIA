import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function AssistenteIA() {

  const [pergunta, setPergunta] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function enviarPergunta(e) {
    e.preventDefault();

    if (!pergunta.trim()) return;

    const perguntaAtual = pergunta;

    setMensagens((antigas) => [
      ...antigas,
      {
        tipo: "usuario",
        texto: perguntaAtual
      }
    ]);

    setPergunta("");
    setCarregando(true);

    try {

      const token = localStorage.getItem("token");

      const resposta = await api.post(
        "/ia",
        {
          pergunta: perguntaAtual
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMensagens((antigas) => [
        ...antigas,
        {
          tipo: "ia",
          texto: resposta.data.resposta
        }
      ]);

    } catch {

      setMensagens((antigas) => [
        ...antigas,
        {
          tipo: "ia",
          texto: "Erro ao consultar o assistente."
        }
      ]);

    }

    setCarregando(false);

  }

  return (

    <>
      <Navbar />

      <div className="container mt-4">

        <div className="card shadow">

          <div className="card-header bg-dark text-white">

            <h3 className="mb-0">
              🤖 Assistente IA
            </h3>

          </div>

          <div
            className="card-body"
            style={{
              height: "500px",
              overflowY: "auto",
              background: "#f5f5f5"
            }}
          >

            {mensagens.length === 0 && (

              <div className="text-center text-muted mt-5">

                <h5>Olá 👋</h5>

                <p>

                  Faça perguntas como:

                </p>

                <ul className="list-unstyled">

                  <li>📦 Faça um resumo do estoque</li>

                  <li>📉 Quais produtos estão com estoque baixo?</li>

                  <li>💰 Qual o valor do estoque?</li>

                  <li>📋 Liste todos os produtos</li>

                </ul>

              </div>

            )}

            {mensagens.map((msg, index) => (

              <div
                key={index}
                className={`d-flex mb-3 ${
                  msg.tipo === "usuario"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >

                <div
                  className={`p-3 rounded shadow-sm ${
                    msg.tipo === "usuario"
                      ? "bg-primary text-white"
                      : "bg-white"
                  }`}
                  style={{
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap"
                  }}
                >

                  {msg.texto}

                </div>

              </div>

            ))}

          </div>

          <div className="card-footer">

            <form onSubmit={enviarPergunta}>

              <div className="input-group">

                <input
                  className="form-control"
                  placeholder="Digite sua pergunta..."
                  value={pergunta}
                  onChange={(e)=>setPergunta(e.target.value)}
                />

                <button
                  className="btn btn-primary"
                  disabled={carregando}
                >

                  {carregando ? "..." : "Enviar"}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </>

  );

}

export default AssistenteIA;