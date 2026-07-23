import prisma from "../config/prisma.js";

export async function movimentarEstoque(req, res) {
  try {
    const { produtoId, tipo, quantidade, observacao } = req.body;

    const produto = await prisma.produto.findUnique({
      where: {
        id: Number(produtoId)
      }
    });

    if (!produto) {
      return res.status(404).json({
        erro: "Produto não encontrado."
      });
    }

    if (tipo === "SAIDA" && produto.quantidade < quantidade) {
      return res.status(400).json({
        erro: "Estoque insuficiente."
      });
    }

    let novaQuantidade = produto.quantidade;

    if (tipo === "ENTRADA") {
      novaQuantidade += Number(quantidade);
    } else {
      novaQuantidade -= Number(quantidade);
    }

    await prisma.produto.update({
      where: {
        id: produto.id
      },
      data: {
        quantidade: novaQuantidade
      }
    });

    const movimentacao = await prisma.movimentacao.create({
      data: {
        tipo,
        quantidade: Number(quantidade),
        observacao,
        produtoId: produto.id,
        usuarioId: req.usuario.id
      }
    });

    return res.status(201).json({
      mensagem: "Movimentação realizada com sucesso.",
      estoqueAtual: novaQuantidade,
      movimentacao
    });

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao movimentar estoque."
    });
  }
}

export async function listarMovimentacoes(req, res) {
  try {
    const movimentacoes = await prisma.movimentacao.findMany({
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(movimentacoes);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao listar movimentações."
    });
  }
}

export async function listarMovimentacoesProduto(req, res) {
  try {
    const { id } = req.params;

    const movimentacoes = await prisma.movimentacao.findMany({
      where: {
        produtoId: Number(id)
      },
      include: {
        produto: true,
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(movimentacoes);

  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao listar movimentações do produto."
    });
  }
}