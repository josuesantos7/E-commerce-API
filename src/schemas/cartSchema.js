import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.uuid(),
  quantity: z.number("A quantidade é obrigatória").int("A quantidade deve ser um número inteiro").positive("A quantidade deve ser um número positivo")
});