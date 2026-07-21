import { Router } from "express";
import { dashboard } from "../controllers/dashboardController.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/dashboard", autenticar, dashboard);

export default router;