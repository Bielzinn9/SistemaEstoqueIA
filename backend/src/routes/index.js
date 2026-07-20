import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        sistema: "Sistema Estoque IA",
        status: "Online",
        versao: "1.0.0"
    });
});

export default router;