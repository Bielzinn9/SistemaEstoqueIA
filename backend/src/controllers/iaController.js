import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/prisma.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function perguntarIA(req, res) {
  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({
        erro: "A pergunta é obrigatória."
      });
    }

    // Busca os produtos do banco
    const produtos = await prisma.produto.findMany({
      orderBy: {
        nome: "asc"
      }
    });

    // Monta um resumo do estoque
    const estoque = produtos
      .map((p) =>
        `Produto: ${p.nome}
Categoria: ${p.categoria}
Quantidade: ${p.quantidade}
Preço: R$ ${p.preco}`
      )
      .join("\n\n");

    const prompt = `
Você é um especialista em controle de estoque.

Analise os dados abaixo e responda em português do Brasil.

=== ESTOQUE ===

${estoque}

=== PERGUNTA ===

${pergunta}

Responda de forma clara, objetiva e organizada.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);

    const resposta = result.response.text();

    return res.json({
      resposta
    });

  } catch (erro) {

    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao consultar a IA."
    });

  }
}