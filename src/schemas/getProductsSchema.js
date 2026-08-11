import { z } from "zod";

export const getProductsSchema = z.object({
    page: z.coerce.number({
        message: "page deve ser um número válido"
    })
    .int("page deve ser um número inteiro")
    .min(1, "page deve ser maior ou igual a 1" )
    .optional(),
    
    limit: z.coerce.number({
        message: "limit deve ser um número válido"
    })
    .int("limit deve ser um número inteiro")
    .min(1, "limit deve ser maior ou igual a 1")
    .max(100, "limit deve ser menor ou igual a 100")
    .optional(),

    search: z.string().optional(),

    minPrice: z.coerce.number({
        message: "minPrice deve ser um número válido"
    })
    .min(0, "minPrice deve ser um número positivo")
    .optional(),

    maxPrice: z.coerce.number({
        message: "maxPrice deve ser um número válido"
    })
    .min(0, "maxPrice deve ser um número positivo")
    .optional(),

    sort: z.enum([
        "name",
        "price",
        "createdAt"
    ], {
        message: "sort deve ser name, price ou createdAt"
    }).optional(),

    order: z.enum([
        "asc",
        "desc"
    ], {
        message: "order deve ser asc ou desc"
    }).optional() 
    
}).refine(
    data => {
        if (
            data.minPrice !== undefined &&
            data.maxPrice !== undefined
        ) {
            return data.minPrice <= data.maxPrice;
        }

        return true;
    },
    {
        message: "minPrice não pode ser maior que maxPrice"
    }
);