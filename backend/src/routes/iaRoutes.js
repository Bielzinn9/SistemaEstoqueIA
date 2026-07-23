import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { mensagem } = req.body;

        res.json({
            resposta: `Recebi sua mensagem: ${mensagem}`
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro na rota da IA"
        });
    }
});

export default router;