import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Produtos from "../pages/Produtos";
import Movimentacoes from "../pages/Movimentacoes";
import AssistenteIA from "../pages/AssistenteIA";
import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/produtos"
          element={
            <PrivateRoute>
              <Produtos />
            </PrivateRoute>
          }
        />

        <Route
          path="/movimentacoes"
          element={
            <PrivateRoute>
              <Movimentacoes />
            </PrivateRoute>
          }
        />

        <Route
          path="/ia"
          element={
            <PrivateRoute>
              <AssistenteIA />
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;