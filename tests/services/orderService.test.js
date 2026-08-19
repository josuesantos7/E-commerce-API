import { describe, it, expect, vi } from "vitest";
import prisma from "../../src/database/prismaClient.js";
import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    updateOrderStatusService
} from "../../src/services/orderService.js";


vi.mock("../../src/database/prismaClient.js", () => ({
    default: {
        cartItem: {
            findMany: vi.fn(),
            deleteMany: vi.fn()
        },
        order: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        orderItem: {
            create: vi.fn()
        },
        product: {
            update: vi.fn()
        },
        $transaction: vi.fn()
    }
}));

describe("createOrderService", () => {
    it("deve lançar erro quando o carrinho estiver vazio", async () => {

        prisma.cartItem.findMany.mockResolvedValue([]);

        const req = {
            userId: "user-1"
        };

        await expect(
            createOrderService(req)
        ).rejects.toThrow("Carrinho vazio");

    });

    it("deve lançar erro quando não houver estoque suficiente", async () => {

        const cartItems = [
            {
                id: "cart-item-1",
                userId: "user-1",
                productId: "product-1",
                quantity: 5,
                product: {
                    id: "product-1",
                    name: "Produto Teste",
                    price: 100,
                    stock: 2
                }
            }
        ];

        prisma.cartItem.findMany.mockResolvedValue(cartItems);

        const req = {
            userId: "user-1"
        };

        await expect(
            createOrderService(req)
        ).rejects.toThrow(
            "Estoque insuficiente para Produto Teste"
        );
    });

    it("deve criar um pedido corretamente", async () => {

        const cartItems = [
            {
                id: "cart-item-1",
                userId: "user-1",
                productId: "product-1",
                quantity: 2,
                product: {
                    id: "product-1",
                    name: "Produto 1",
                    price: 100,
                    stock: 10
                }
            },
            {
                id: "cart-item-2",
                userId: "user-1",
                productId: "product-2",
                quantity: 1,
                product: {
                    id: "product-2",
                    name: "Produto 2",
                    price: 50,
                    stock: 5
                }
            }
        ];

        const createdOrder = {
            id: "order-1",
            userId: "user-1",
            total: 250
        };

        prisma.cartItem.findMany.mockResolvedValue(cartItems);

        const tx = {
            order: {
                create: vi.fn().mockResolvedValue(createdOrder)
            },
            orderItem: {
                create: vi.fn().mockResolvedValue({})
            },
            product: {
                update: vi.fn().mockResolvedValue({})
            },
            cartItem: {
                deleteMany: vi.fn().mockResolvedValue({})
            }
        };

        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(tx);
        });

        const req = {
            userId: "user-1"
        };

        const result = await createOrderService(req);

        expect(result).toEqual(createdOrder);

        expect(tx.order.create).toHaveBeenCalledWith({
            data: {
                userId: "user-1",
                total: 250
            }
        });

        expect(tx.orderItem.create).toHaveBeenCalledTimes(2);

        expect(tx.product.update).toHaveBeenCalledTimes(2);

        expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
            where: {
                userId: "user-1"
            }
        });
    });

    it("deve criar os itens do pedido e atualizar o estoque corretamente", async () => {

        const cartItems = [
            {
                id: "cart-item-1",
                userId: "user-1",
                productId: "product-1",
                quantity: 2,
                product: {
                    id: "product-1",
                    name: "Produto 1",
                    price: 100,
                    stock: 10
                }
            },
            {
                id: "cart-item-2",
                userId: "user-1",
                productId: "product-2",
                quantity: 1,
                product: {
                    id: "product-2",
                    name: "Produto 2",
                    price: 50,
                    stock: 5
                }
            }
        ];

        const createdOrder = {
            id: "order-1",
            userId: "user-1",
            total: 250
        };

        prisma.cartItem.findMany.mockResolvedValue(cartItems);

        const tx = {
            order: {
                create: vi.fn().mockResolvedValue(createdOrder)
            },
            orderItem: {
                create: vi.fn().mockResolvedValue({})
            },
            product: {
                update: vi.fn().mockResolvedValue({})
            },
            cartItem: {
                deleteMany: vi.fn().mockResolvedValue({})
            }
        };

        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(tx);
        });

        const req = {
            userId: "user-1"
        };

        await createOrderService(req);

        expect(tx.orderItem.create).toHaveBeenNthCalledWith(1, {
            data: {
                orderId: "order-1",
                productId: "product-1",
                quantity: 2,
                price: 100
            }
        });

        expect(tx.orderItem.create).toHaveBeenNthCalledWith(2, {
            data: {
                orderId: "order-1",
                productId: "product-2",
                quantity: 1,
                price: 50
            }
        });

        expect(tx.product.update).toHaveBeenNthCalledWith(1, {
            where: {
                id: "product-1"
            },
            data: {
                stock: 8
            }
        });

        expect(tx.product.update).toHaveBeenNthCalledWith(2, {
            where: {
                id: "product-2"
            },
            data: {
                stock: 4
            }
        });
    });
});