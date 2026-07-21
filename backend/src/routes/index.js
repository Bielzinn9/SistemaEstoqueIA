import { Router } from "express";
import produtoRoutes from "./produtoRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import movimentacaoRoutes from "./movimentacaoRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    sistema: "Sistema Estoque IA",
    status: "Online"
  });
});

router.use(usuarioRoutes);
router.use(authRoutes);
router.use(dashboardRoutes);
router.use(produtoRoutes);
router.use(movimentacaoRoutes);

export default router;