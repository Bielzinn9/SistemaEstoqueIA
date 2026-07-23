import prisma from "../config/prisma.js";

export async function perguntarIA(req, res) {
  try {
    const { pergunta } = req.body;

    const produtos = await prisma.produto.findMany();

    const texto = pergunta.toLowerCase();

    // Estoque baixo
    if (
      texto.includes("estoque baixo") ||
      texto.includes("reposição") ||
      texto.includes("comprar")
    ) {
      const baixos = produtos.filter((p) => p.quantidade <= 5);

      if (baixos.length === 0) {
        return res.json({
          resposta: "Nenhum produto está com estoque baixo."
        });
      }

      return res.json({
        resposta:
          "Produtos que precisam de reposição:\n\n" +
          baixos
            .map((p) => `${p.nome} - Quantidade: ${p.quantidade}`)
            .join("\n")
      });
    }

    // Resumo
    if (
      texto.includes("resumo") ||
      texto.includes("estoque")
    ) {

      const totalProdutos = produtos.length;

      const totalItens = produtos.reduce(
        (soma, p) => soma + p.quantidade,
        0
      );

      const valor = produtos.reduce(
        (soma, p) => soma + p.quantidade * p.preco,
        0
      );

      return res.json({
        resposta:
`Resumo do estoque

• Produtos cadastrados: ${totalProdutos}

• Total de itens: ${totalItens}

• Valor do estoque: R$ ${valor.toFixed(2)}`
      });
    }

    // Valor
    if (texto.includes("valor")) {

      const valor = produtos.reduce(
        (soma, p) => soma + p.quantidade * p.preco,
        0
      );

      return res.json({
        resposta: `O valor total do estoque é R$ ${valor.toFixed(2)}.`
      });
    }

    // Produtos
    if (
      texto.includes("produtos") ||
      texto.includes("listar")
    ) {

      return res.json({
        resposta:
          produtos
            .map(
              (p) =>
                `${p.nome} (${p.quantidade} unidades)`
            )
            .join("\n")
      });
    }

    return res.json({
      resposta:
        "Posso responder perguntas como:\n\n• Faça um resumo do estoque\n• Quais produtos estão com estoque baixo?\n• Qual o valor do estoque?\n• Liste os produtos."
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao consultar assistente."
    });

  }
}