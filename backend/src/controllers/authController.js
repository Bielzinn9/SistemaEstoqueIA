import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: "Email ou senha inválidos.",
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        erro: "Email ou senha inválidos.",
      });
    }

    // Verifica se a chave JWT está sendo carregada
    console.log("JWT_SECRET LOGIN:", process.env.JWT_SECRET);

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
      token,
    });

  } catch (erro) {
    console.error("ERRO NO LOGIN:");
    console.error(erro);

    return res.status(500).json({
      erro: "Erro interno do servidor.",
      mensagem: erro.message,
    });
  }
}