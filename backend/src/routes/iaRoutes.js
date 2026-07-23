import { Router } from "express";
import { perguntarIA } from "../controllers/iaController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", autenticar, perguntarIA);

export default router;