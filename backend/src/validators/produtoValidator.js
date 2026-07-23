import { z } from "zod";

export const produtoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.string().min(2, "Categoria obrigatória"),
  preco: z.number().positive("Preço deve ser maior que zero"),
  quantidade: z.number().int().min(0, "Quantidade não pode ser negativa")
});