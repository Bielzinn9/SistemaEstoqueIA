import prisma from "../config/prisma.js";
import { produtoSchema } from "../validators/produtoValidator.js";

export async function criarProduto(req, res) {
  try {

    const dados = produtoSchema.parse({
      ...req.body,
      preco: Number(req.body.preco),
      quantidade: Number(req.body.quantidade)
    });

    const produto = await prisma.produto.create({
      data: dados
    });

    return res.status(201).json(produto);

  } catch (erro) {

    console.error(erro);

    if (erro.name === "ZodError") {
      return res.status(400).json({
        erro: "Dados inválidos.",
        detalhes: erro.issues
      });
    }

    return res.status(500).json({
      erro: "Erro ao cadastrar produto."
    });
  }
}

export async function listarProdutos(req, res) {
  try {
    const { nome, categoria } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const where = {
      ...(nome && {
        nome: {
          contains: nome,
          mode: "insensitive"
        }
      }),
      ...(categoria && {
        categoria: {
          contains: categoria,
          mode: "insensitive"
        }
      })
    };

    const total = await prisma.produto.count({
      where
    });

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: {
        nome: "asc"
      },
      skip,
      take: limit
    });

    return res.json({
      pagina: page,
      limite: limit,
      total,
      totalPaginas: Math.ceil(total / limit),
      produtos
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao listar produtos."
    });
  }
}

export async function estoqueBaixo(req, res) {
  try {
    const limite = Number(req.query.limite) || 5;

    const produtos = await prisma.produto.findMany({
      where: {
        quantidade: {
          lte: limite
        }
      },
      orderBy: {
        quantidade: "asc"
      }
    });

    return res.json({
      limite,
      total: produtos.length,
      produtos
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao consultar estoque baixo."
    });
  }
}

export async function buscarProduto(req, res) {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    return res.json(produto);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao buscar produto."
    });
  }
}

export async function atualizarProduto(req, res) {
  try {

    const { id } = req.params;

    const dados = produtoSchema.parse({
      ...req.body,
      preco: Number(req.body.preco),
      quantidade: Number(req.body.quantidade)
    });

    const produto = await prisma.produto.update({
      where: {
        id: Number(id)
      },
      data: dados
    });

    return res.json(produto);

  } catch (erro) {

    console.error(erro);

    if (erro.name === "ZodError") {
      return res.status(400).json({
        erro: "Dados inválidos.",
        detalhes: erro.issues
      });
    }

    return res.status(500).json({
      erro: "Erro ao atualizar produto."
    });
  }
}

export async function excluirProduto(req, res) {
  try {
    const { id } = req.params;

    await prisma.produto.delete({
      where: {
        id: Number(id)
      }
    });

    return res.json({
      mensagem: "Produto removido com sucesso."
    });

  } catch (erro) {

    console.error(erro);

    if (erro.code === "P2003") {
      return res.status(400).json({
        erro: "Não é possível excluir este produto porque existem movimentações vinculadas a ele."
      });
    }

    return res.status(500).json({
      erro: "Erro ao excluir produto."
    });
  }
}