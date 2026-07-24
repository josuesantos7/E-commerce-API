import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  description: z
    .string()
    .min(10, "Descrição muito curta"),

  price: z
    .number()
    .positive("Preço deve ser maior que zero"),

  stock: z
    .number()
    .int()
    .min(0, "Estoque não pode ser negativo")
});