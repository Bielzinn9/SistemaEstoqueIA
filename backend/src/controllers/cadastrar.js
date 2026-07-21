import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
export async function cadastrar(req, res) {
    try {
        const { nome, email, senha } = req.body;
        const usuarioExiste = await prisma.usuario.findUnique({
            where: { email }
        });
        if (usuarioExiste) {
            return res.status(400).json({
                erro: "Email já cadastrado."
            });
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaCriptografada
            }
        });
        res.status(201).json(usuario);
    }
    catch (erro) {
        console.error("ERRO COMPLETO:");
        console.error(erro);
        res.status(500).json({
            mensagem: erro.message,
            erro
        });
    }
}
