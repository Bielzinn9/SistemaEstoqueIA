import prisma from "../config/prisma.js";

export async function criarProduto(req, res) {
  try {
    const { nome, descricao, categoria, preco, quantidade } = req.body;

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        categoria,
        preco: Number(preco),
        quantidade: Number(quantidade)
      }
    });

    return res.status(201).json(produto);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao cadastrar produto."
    });
  }
}

export async function listarProdutos(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: "asc"
      }
    });

    return res.json(produtos);

  } catch (erro) {
    return res.status(500).json({
      erro: "Erro ao listar produtos."
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
    return res.status(500).json({
      erro: "Erro ao buscar produto."
    });
  }
}

export async function atualizarProduto(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao, categoria, preco, quantidade } = req.body;

    const produto = await prisma.produto.update({
      where: {
        id: Number(id)
      },
      data: {
        nome,
        descricao,
        categoria,
        preco: Number(preco),
        quantidade: Number(quantidade)
      }
    });

    return res.json(produto);

  } catch (erro) {
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
    return res.status(500).json({
      erro: "Erro ao excluir produto."
    });
  }
}