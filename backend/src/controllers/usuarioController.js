import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

export async function cadastrar(req, res) {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (usuarioExiste) {
      return res.status(400).json({
        erro: "Email já cadastrado.",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
      },
    });

    return res.status(201).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      createdAt: usuario.createdAt,
    });
  } catch (erro) {
    console.error("ERRO COMPLETO:");
    console.error(erro);

    return res.status(500).json({
      mensagem: erro.message,
    });
  }
}