import { Router } from "express";
import { movimentarEstoque } from "../controllers/movimentacaoController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/estoque/movimentar", autenticar, movimentarEstoque);

export default router;