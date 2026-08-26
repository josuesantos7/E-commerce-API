import { describe, it, expect, vi } from "vitest";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../../src/controllers/orderController.js";

vi.mock("../../src/services/orderService.js", () => ({
    createOrderService: vi.fn(),
    getOrdersService: vi.fn(),
    getOrderByIdService: vi.fn(),
    updateOrderStatusService: vi.fn()
}));

import {
    createOrderService,
    getOrdersService,
    getOrderByIdService,
    updateOrderStatusService
} from "../../src/services/orderService.js";


describe("orderController - createOrder", () => {

    it("deve criar pedido e retornar 201", async () => {

        const order = {
            id: "order-1",
            userId: "user-1",
            total: 250
        };

        createOrderService.mockResolvedValue(order);

        const req = {
            userId: "user-1"
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await createOrder(req, res, next);

        expect(createOrderService).toHaveBeenCalledWith("user-1");

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith({
            message: "Pedido criado com sucesso",
            order
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o createOrderService lançar erro", async () => {

        const error = new Error("Carrinho vazio");

        createOrderService.mockRejectedValue(error);

        const req = {
            userId: "user-1"
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await createOrder(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("orderController - getOrders", () => {

    it("deve retornar os pedidos do usuário", async () => {

        const orders = [
            {
                id: "order-1",
                userId: "user-1",
                total: 250
            },
            {
                id: "order-2",
                userId: "user-1",
                total: 150
            }
        ];

        getOrdersService.mockResolvedValue(orders);

        const req = {
            userId: "user-1"
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getOrders(req, res, next);

        expect(getOrdersService).toHaveBeenCalledWith("user-1");

        expect(res.json).toHaveBeenCalledWith(orders);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o getOrdersService lançar erro", async () => {

        const error = new Error("Erro ao buscar pedidos");

        getOrdersService.mockRejectedValue(error);

        const req = {
            userId: "user-1"
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getOrders(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("orderController - getOrderById", () => {

    it("deve retornar o pedido encontrado", async () => {

        const order = {
            id: "order-1",
            userId: "user-1",
            total: 250
        };

        getOrderByIdService.mockResolvedValue(order);

        const req = {
            params: {
                id: "order-1"
            },
            userId: "user-1"
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getOrderById(req, res, next);

        expect(getOrderByIdService).toHaveBeenCalledWith("order-1",
            "user-1");

        expect(res.json).toHaveBeenCalledWith(order);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o getOrderByIdService lançar erro", async () => {

        const error = new Error("Pedido não encontrado");

        getOrderByIdService.mockRejectedValue(error);

        const req = {
            params: {
                id: "order-inexistente"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getOrderById(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("orderController - updateOrderStatus", () => {

    it("deve atualizar o status do pedido", async () => {

        const order = {
            id: "order-1",
            userId: "user-1",
            total: 250,
            status: "PAID"
        };

        updateOrderStatusService.mockResolvedValue(order);

        const req = {
            params: {
                id: "order-1"
            },
            body: {
                status: "PAID"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await updateOrderStatus(req, res, next);

        expect(updateOrderStatusService).toHaveBeenCalledWith("order-1",
            "PAID");

        expect(res.json).toHaveBeenCalledWith(order);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o updateOrderStatusService lançar erro", async () => {

        const error = new Error("Status inválido");

        updateOrderStatusService.mockRejectedValue(error);

        const req = {
            params: {
                id: "order-1"
            },
            body: {
                status: "INVALID"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await updateOrderStatus(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});