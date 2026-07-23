import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  function sair() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">

      <div className="container">

        <Link className="navbar-brand fw-bold" to="/dashboard">
          📦 Sistema Estoque IA
        </Link>

        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="menu"
        >

          <ul className="navbar-nav me-auto">

            <li className="nav-item">

              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>

            </li>

            <li className="nav-item">

              <Link className="nav-link" to="/produtos">
                Produtos
              </Link>

            </li>

            <li className="nav-item">

              <Link className="nav-link" to="/movimentacoes">
                Movimentações
              </Link>

            </li>

          </ul>

          <span className="text-white me-3">

            👤 {usuario?.nome}

          </span>

          <button
            className="btn btn-outline-light"
            onClick={sair}
          >
            Sair
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;