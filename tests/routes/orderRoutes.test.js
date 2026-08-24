import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../src/app.js";

import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../../src/controllers/orderController.js";


vi.mock("jsonwebtoken", async () => {
    const actual = await vi.importActual("jsonwebtoken");

    return {
        ...actual,
        default: {
            ...actual.default,
            verify: vi.fn()
        }
    };
});


vi.mock("../../src/controllers/orderController.js", () => ({
    createOrder: vi.fn((req, res) => {
        return res.status(201).json({
            message: "Pedido criado com sucesso",
            order: {
                id: "order-123"
            }
        });
    }),

    getOrders: vi.fn((req, res) => {
        return res.status(200).json([
            {
                id: "order-123"
            }
        ]);
    }),

    getOrderById: vi.fn((req, res) => {
        return res.status(200).json({
            id: "order-123"
        });
    }),

    updateOrderStatus: vi.fn((req, res) => {
        return res.status(200).json({
            id: "order-123",
            status: req.body.status
        });
    })
}));


describe("Order Routes", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Criar pedido.
    describe("POST /orders", () => {

        it("deve criar pedido com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .post("/orders")
                .set("Authorization", "Bearer token-falso");

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                message: "Pedido criado com sucesso",
                order: {
                    id: "order-123"
                }
            });

            expect(createOrder).toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .post("/orders");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(createOrder).not.toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .post("/orders")
                .set("Authorization", "Bearer token-invalido");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(createOrder).not.toHaveBeenCalled();

        });

    });

    // Obter pedidos do usuário.
    describe("GET /orders", () => {

        it("deve retornar os pedidos do usuário com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .get("/orders")
                .set("Authorization", "Bearer token-falso");

            expect(response.status).toBe(200);

            expect(response.body).toEqual([
                {
                    id: "order-123"
                }
            ]);

            expect(getOrders).toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .get("/orders");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(getOrders).not.toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .get("/orders")
                .set("Authorization", "Bearer token-invalido");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(getOrders).not.toHaveBeenCalled();

        });

    });

    // Obter pedido por ID.
    describe("GET /orders/:id", () => {

        it("deve retornar o pedido encontrado", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .get("/orders/order-123")
                .set("Authorization", "Bearer token-falso");

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                id: "order-123"
            });

            expect(getOrderById).toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .get("/orders/order-123");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(getOrderById).not.toHaveBeenCalled();

        });


        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .get("/orders/order-123")
                .set("Authorization", "Bearer token-invalido");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(getOrderById).not.toHaveBeenCalled();

        });

    });

    // Atualizar status do pedido.
    describe("PUT /orders/:id/status", () => {

        it("deve atualizar o status do pedido com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "admin-123",
                role: "admin"
            });

            const response = await request(app)
                .put("/orders/order-123/status")
                .set("Authorization", "Bearer token-falso")
                .send({
                    status: "paid"
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                id: "order-123",
                status: "paid"
            });

            expect(updateOrderStatus).toHaveBeenCalled();
        });


        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .put("/orders/order-123/status")
                .send({
                    status: "paid"
                });

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(updateOrderStatus).not.toHaveBeenCalled();
        });


        it("deve retornar 403 quando o usuário não for admin", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .put("/orders/order-123/status")
                .set("Authorization", "Bearer token-falso")
                .send({
                    status: "paid"
                });

            expect(response.status).toBe(403);

            expect(response.body).toEqual({
                error: "Acesso negado"
            });

            expect(updateOrderStatus).not.toHaveBeenCalled();
        });


        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .put("/orders/order-123/status")
                .set("Authorization", "Bearer token-invalido")
                .send({
                    status: "paid"
                });

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(updateOrderStatus).not.toHaveBeenCalled();
        });


        it("deve retornar 400 quando o status for inválido", async () => {

            jwt.verify.mockReturnValue({
                id: "admin-123",
                role: "admin"
            });

            const response = await request(app)
                .put("/orders/order-123/status")
                .set("Authorization", "Bearer token-falso")
                .send({
                    status: "status-invalido"
                });

            expect(response.status).toBe(400);

            expect(updateOrderStatus).not.toHaveBeenCalled();
        });
    });
});