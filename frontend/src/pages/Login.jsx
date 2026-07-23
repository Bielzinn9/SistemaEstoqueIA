import { useState } from "react";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar(e) {
    e.preventDefault();

    try {
      const resposta = await api.post("/login", {
        email,
        senha,
      });

      // Salva o token
      localStorage.setItem("token", resposta.data.token);

      // Salva os dados do usuário
      localStorage.setItem(
        "usuario",
        JSON.stringify(resposta.data.usuario)
      );

      alert("Login realizado com sucesso!");

      // Redireciona para o dashboard
      window.location.href = "/dashboard";

    } catch (erro) {
      alert(
        erro.response?.data?.erro || "Email ou senha inválidos."
      );
    }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body">

              <h2 className="text-center mb-4">
                Sistema Estoque IA
              </h2>

              <form onSubmit={entrar}>

                <div className="mb-3">
                  <label className="form-label">Email</label>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Senha</label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                >
                  Entrar
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;