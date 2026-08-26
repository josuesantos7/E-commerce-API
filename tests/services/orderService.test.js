import { describe, it, expect, vi, beforeEach } from "vitest";
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
            findFirst: vi.fn(),
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

        const userId = "user-1";

        await expect(
            createOrderService(userId)
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

        await expect(
            createOrderService("user-1")
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

        const userId = "user-1";

        const result = await createOrderService(userId);

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

        const userId = "user-1";

        await createOrderService(userId);

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

describe("getOrdersService", () => {
    it("deve retornar os pedidos do usuário", async () => {

        const orders = [
            {
                id: "order-1",
                userId: "user-1",
                total: 250,
                orderItems: [
                    {
                        id: "order-item-1",
                        productId: "product-1",
                        quantity: 2,
                        price: 100,
                        product: {
                            id: "product-1",
                            name: "Produto 1",
                            price: 100
                        }
                    }
                ]
            }
        ];

        prisma.order.findMany.mockResolvedValue(orders);

        const userId = "user-1";

        const result = await getOrdersService(userId);

        expect(result).toEqual(orders);

        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                userId: "user-1"
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
    });
});

describe("getOrderByIdService", () => {
    it("deve lançar erro quando o pedido não for encontrado", async () => {

        prisma.order.findFirst.mockResolvedValue(null);

        const orderId = "order-inexistente";
        const userId = "user-1";

        await expect(
            getOrderByIdService(orderId, userId)
        ).rejects.toThrow("Pedido não encontrado");

        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                id: "order-inexistente",
                userId: "user-1"
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
    });

    it("deve retornar o pedido pelo ID", async () => {

        const order = {
            id: "order-1",
            userId: "user-1",
            total: 250,
            orderItems: [
                {
                    id: "order-item-1",
                    productId: "product-1",
                    quantity: 2,
                    price: 100,
                    product: {
                        id: "product-1",
                        name: "Produto 1",
                        price: 100
                    }
                }
            ]
        };

        prisma.order.findFirst.mockResolvedValue(order);

        const orderId = "order-1";
        const userId = "user-1";

        const result = await getOrderByIdService(orderId, userId);

        expect(result).toEqual(order);

        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                id: "order-1",
                userId: "user-1"
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
    });

    it("deve lançar erro quando o pedido não pertencer ao usuário", async () => {

        prisma.order.findFirst.mockResolvedValue(null);

        const orderId = "order-1";
        const userId = "user-999";

        await expect(
            getOrderByIdService(orderId, userId)
        ).rejects.toThrow("Pedido não encontrado");

        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                id: "order-1",
                userId: "user-999"
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });
    });
});

describe("updateOrderStatusService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve atualizar o status do pedido corretamente", async () => {

        const updatedOrder = {
            id: "order-1",
            userId: "user-1",
            total: 250,
            status: "SHIPPED"
        };

        prisma.order.update.mockResolvedValue(updatedOrder);

        const result = await updateOrderStatusService("order-1",
            "SHIPPED");

        expect(result).toEqual(updatedOrder);

        expect(prisma.order.update).toHaveBeenCalledWith({
            where: {
                id: "order-1"
            },
            data: {
                status: "SHIPPED"
            }
        });
    });

    it("deve lançar erro quando o ID do pedido não for informado", async () => {

        await expect(
            updateOrderStatusService(undefined, "SHIPPED")
        ).rejects.toThrow("ID do pedido ou status não encontrados");

        expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro quando o status não for informado", async () => {
        await expect(
            updateOrderStatusService("order-1", undefined)
        ).rejects.toThrow("ID do pedido ou status não encontrados");

        expect(prisma.order.update).not.toHaveBeenCalled();
    });
});