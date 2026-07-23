import { Router } from "express";
import {
  criarProduto,
  listarProdutos,
  buscarProduto,
  atualizarProduto,
  excluirProduto,
  estoqueBaixo
} from "../controllers/produtoController.js";

import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/produtos", autenticar, criarProduto);

router.get("/produtos", autenticar, listarProdutos);

router.get("/produtos/estoque-baixo", autenticar, estoqueBaixo);

router.get("/produtos/:id", autenticar, buscarProduto);

router.put("/produtos/:id", autenticar, atualizarProduto);

router.delete("/produtos/:id", autenticar, excluirProduto);


router.get(
  "/produtos/estoque-baixo",
  autenticar,
  estoqueBaixo
);

export default router;