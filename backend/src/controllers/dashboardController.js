import prisma from "../config/prisma.js";

export async function dashboard(req, res) {
  try {

    const totalProdutos = await prisma.produto.count();

    const produtos = await prisma.produto.findMany();

    const totalItens = produtos.reduce(
      (total, produto) => total + produto.quantidade,
      0
    );

    const valorEstoque = produtos.reduce(
      (total, produto) => total + (produto.preco * produto.quantidade),
      0
    );

    const estoqueBaixo = await prisma.produto.count({
      where: {
        quantidade: {
          lte: 5
        }
      }
    });

    const totalMovimentacoes = await prisma.movimentacao.count();

    const entradas = await prisma.movimentacao.count({
      where: {
        tipo: "ENTRADA"
      }
    });

    const saidas = await prisma.movimentacao.count({
      where: {
        tipo: "SAIDA"
      }
    });

    const ultimaMovimentacao = await prisma.movimentacao.findFirst({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        produto: true,
        usuario: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    return res.json({
      totalProdutos,
      totalItens,
      valorEstoque,
      estoqueBaixo,
      totalMovimentacoes,
      entradas,
      saidas,
      ultimaMovimentacao
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao carregar dashboard."
    });

  }
}