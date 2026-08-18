import { describe, it, expect, vi } from "vitest";
import prisma from "../../src/database/prismaClient.js";
import { getProductsService } from "../../src/services/productService.js";


vi.mock("../../src/database/prismaClient.js", () => ({
    default: {
        product: {
            findMany: vi.fn(),
            count: vi.fn()
        }
    }
}));

describe("getProductsService", () => {

    it("deve retornar os produtos com paginação padrão", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento Básico",
                description: "Polimento automotivo",
                price: 250,
                stock: 10
            },
            {
                id: "product-2",
                name: "Lavagem Premium",
                description: "Lavagem completa",
                price: 450,
                stock: 5
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);

        prisma.product.count.mockResolvedValue(2);

        const result = await getProductsService();

        expect(result).toEqual({
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            data: products
        });

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

    it("deve aplicar paginação corretamente", async () => {

        const products = [
            {
                id: "product-6",
                name: "Produto 6",
                description: "Descrição",
                price: 100,
                stock: 10
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);

        prisma.product.count.mockResolvedValue(6);

        const result = await getProductsService(2, 5);

        expect(result.page).toBe(2);
        expect(result.limit).toBe(5);
        expect(result.total).toBe(6);
        expect(result.totalPages).toBe(2);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 5,
            take: 5,
            orderBy: {
                createdAt: "desc"
            }
        });
    });

    it("deve filtrar produtos por nome ou descrição", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento Básico",
                description: "Polimento automotivo",
                price: 250,
                stock: 10
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);

        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "polimento"
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                OR: [
                    {
                        name: {
                            contains: "polimento",
                            mode: "insensitive"
                        }
                    },
                    {
                        description: {
                            contains: "polimento",
                            mode: "insensitive"
                        }
                    }
                ]
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });
    });

    it("deve filtrar produtos pelo preço mínimo", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento Premium",
                description: "Polimento completo",
                price: 300,
                stock: 5
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            250
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                price: {
                    gte: 250
                }
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

    it("deve filtrar produtos pelo preço máximo", async () => {

        const products = [
            {
                id: "product-1",
                name: "Lavagem Básica",
                description: "Lavagem simples",
                price: 150,
                stock: 10
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            undefined,
            250
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                price: {
                    lte: 250
                }
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

    it("deve filtrar produtos por intervalo de preço", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento Premium",
                description: "Polimento completo",
                price: 250,
                stock: 5
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            100,
            300
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {
                price: {
                    gte: 100,
                    lte: 300
                }
            },
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

    it("deve ordenar os produtos pelo preço em ordem crescente", async () => {

        const products = [
            {
                id: "product-1",
                name: "Lavagem",
                description: "Lavagem básica",
                price: 100,
                stock: 10
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            undefined,
            undefined,
            "price",
            "asc"
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            orderBy: {
                price: "asc"
            }
        });

    });

    it("deve ordenar os produtos pelo preço em ordem decrescente", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento Premium",
                description: "Polimento completo",
                price: 500,
                stock: 5
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            undefined,
            undefined,
            "price",
            "desc"
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            orderBy: {
                price: "desc"
            }
        });
    });

    it("deve utilizar a ordenação padrão quando o campo de ordenação for inválido", async () => {

        const products = [
            {
                id: "product-1",
                name: "Polimento",
                description: "Polimento automotivo",
                price: 250,
                stock: 5
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            undefined,
            undefined,
            "invalidField",
            "asc"
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

    it("deve utilizar a ordenação padrão quando a ordem for inválida", async () => {

        const products = [
            {
                id: "product-1",
                name: "Produto Teste",
                description: "Descrição",
                price: 250,
                stock: 10
            }
        ];

        prisma.product.findMany.mockResolvedValue(products);
        prisma.product.count.mockResolvedValue(1);

        const result = await getProductsService(
            1,
            10,
            "",
            undefined,
            undefined,
            "price",
            "invalidOrder"
        );

        expect(result.data).toEqual(products);

        expect(prisma.product.findMany).toHaveBeenCalledWith({
            where: {},
            skip: 0,
            take: 10,
            orderBy: {
                createdAt: "desc"
            }
        });

    });

});