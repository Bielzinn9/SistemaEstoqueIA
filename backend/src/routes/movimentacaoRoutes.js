import { Router } from "express";
import {
  movimentarEstoque,
  listarMovimentacoes,
  listarMovimentacoesProduto
} from "../controllers/movimentacaoController.js";

import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/estoque/movimentar", autenticar, movimentarEstoque);

router.get("/movimentacoes", autenticar, listarMovimentacoes);

router.get(
  "/produtos/:id/movimentacoes",
  autenticar,
  listarMovimentacoesProduto
);

export default router;