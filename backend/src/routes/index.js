import { Router } from "express";
import produtoRoutes from "./produtoRoutes.js";
import usuarioRoutes from "./usuarioRoutes.js";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import movimentacaoRoutes from "./movimentacaoRoutes.js";
import iaRoutes from "./iaRoutes.js";

const router = Router();

router.use(usuarioRoutes);
router.use(authRoutes);
router.use(dashboardRoutes);
router.use(produtoRoutes);
router.use(movimentacaoRoutes);
router.use("/ia", iaRoutes);

export default router;