import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../src/database/prismaClient.js";
import {
    addToCartService,
    getCartService,
    removeFromCartService
} from "../../src/services/cartService.js";


vi.mock("../../src/database/prismaClient.js", () => ({
    default: {
        product: {
            findUnique: vi.fn()
        },
        cartItem: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
            delete: vi.fn()
        }
    }
}));

describe("addToCartService", () => {
    it("deve adicionar um novo produto ao carrinho", async () => {

        const product = {
            id: "product-1",
            name: "Produto Teste",
            price: 250
        };

        const createdItem = {
            id: "cart-item-1",
            userId: "user-1",
            productId: "product-1",
            quantity: 2
        };

        prisma.product.findUnique.mockResolvedValue(product);

        prisma.cartItem.findFirst.mockResolvedValue(null);

        prisma.cartItem.create.mockResolvedValue(createdItem);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-1",
                quantity: 2
            }
        };

        const result = await addToCartService(req);

        expect(result).toEqual(createdItem);

        expect(prisma.product.findUnique).toHaveBeenCalledWith({
            where: {
                id: "product-1"
            }
        });

        expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
            where: {
                userId: "user-1",
                productId: "product-1"
            }
        });

        expect(prisma.cartItem.create).toHaveBeenCalledWith({
            data: {
                userId: "user-1",
                productId: "product-1",
                quantity: 2
            }
        });
    });

    it("deve atualizar a quantidade quando o produto já estiver no carrinho", async () => {

        const product = {
            id: "product-1",
            name: "Produto Teste",
            price: 250
        };

        const existingItem = {
            id: "cart-item-1",
            userId: "user-1",
            productId: "product-1",
            quantity: 2
        };

        const updatedItem = {
            ...existingItem,
            quantity: 5
        };

        prisma.product.findUnique.mockResolvedValue(product);

        prisma.cartItem.findFirst.mockResolvedValue(existingItem);

        prisma.cartItem.update.mockResolvedValue(updatedItem);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-1",
                quantity: 3
            }
        };

        const res = {
            json: vi.fn()
        };

        const result = await addToCartService(req, res);

        expect(prisma.cartItem.update).toHaveBeenCalledWith({
            where: {
                id: "cart-item-1"
            },
            data: {
                quantity: 5
            }
        });

        expect(res.json).toHaveBeenCalledWith(updatedItem);

    });

    it("deve lançar erro quando o produto não for encontrado", async () => {

        prisma.product.findUnique.mockResolvedValue(null);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-inexistente",
                quantity: 2
            }
        };

        await expect(
            addToCartService(req)
        ).rejects.toThrow("Produto não encontrado");
    });

    it("deve lançar erro quando a quantidade for inválida", async () => {

        const product = {
            id: "product-1",
            name: "Produto Teste",
            price: 250
        };

        prisma.product.findUnique.mockResolvedValue(product);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-1",
                quantity: 0
            }
        };

        await expect(
            addToCartService(req)
        ).rejects.toThrow("Quantidade inválida");
    });
});