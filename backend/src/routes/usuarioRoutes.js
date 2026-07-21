import { Router } from "express";
import { cadastrar } from "../controllers/cadastrar";

const router = Router();

router.post("/usuarios", cadastrar);

export default router;