import { Router } from "express";
import { cadastrar } from "../controllers/usuarioController.js";

const router = Router();

router.post("/usuarios", cadastrar);

export default router;