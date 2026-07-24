import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      "pending",
      "paid",
      "shipping",
      "delivered",
      "canceled"
    ],
    {
      error: "Somente os seguintes status são permitidos: pending, paid, shipping, delivered e canceled."
    }
  )
});