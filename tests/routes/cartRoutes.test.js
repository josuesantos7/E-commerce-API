import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../src/app.js";
import {
    addToCart,
    getCart,
    removeFromCart
} from "../../src/controllers/cartController.js";

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

vi.mock("../../src/controllers/cartController.js", () => ({
    addToCart: vi.fn((req, res) => {
        return res.status(201).json({
            message: "Produto adicionado ao carrinho."
        });
    }),

    getCart: vi.fn((req, res) => {
        return res.status(200).json({
            items: []
        });
    }),

    removeFromCart: vi.fn((req, res) => {
        return res.status(200).json({
            message: "Produto removido do carrinho."
        });
    })
}));

describe("Cart Routes", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Criar carrinho
    describe("POST /cart", () => {

        it("deve adicionar produto ao carrinho com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .post("/cart")
                .set("Authorization", "Bearer token-falso")
                .send({
                    productId: "550e8400-e29b-41d4-a716-446655440000",
                    quantity: 2
                });

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                message: "Produto adicionado ao carrinho."
            });

            expect(addToCart).toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .post("/cart")
                .send({
                    productId: "product-123",
                    quantity: 2
                });

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(addToCart).not.toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .post("/cart")
                .set("Authorization", "Bearer token-invalido")
                .send({
                    productId: "product-123",
                    quantity: 2
                });

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(addToCart).not.toHaveBeenCalled();

        });

        it("deve retornar 400 quando os dados forem inválidos", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .post("/cart")
                .set("Authorization", "Bearer token-falso")
                .send({
                    productId: "product-123",
                    quantity: 0
                });

            expect(response.status).toBe(400);

            expect(addToCart).not.toHaveBeenCalled();
        });

    });

    // Listar carrinho.
    describe("GET /cart", () => {

        it("deve retornar o carrinho com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .get("/cart")
                .set("Authorization", "Bearer token-falso");

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                items: []
            });

            expect(getCart).toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .get("/cart");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(getCart).not.toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .get("/cart")
                .set("Authorization", "Bearer token-invalido");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(getCart).not.toHaveBeenCalled();

        });
    });

    // Remover produto do carrinho.
    describe("DELETE /cart/:id", () => {

        it("deve remover produto do carrinho com sucesso", async () => {

            jwt.verify.mockReturnValue({
                id: "user-123",
                role: "USER"
            });

            const response = await request(app)
                .delete("/cart/cart-item-123")
                .set("Authorization", "Bearer token-falso");

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                message: "Produto removido do carrinho."
            });

            expect(removeFromCart).toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token não for informado", async () => {

            const response = await request(app)
                .delete("/cart/cart-item-123");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token não informado"
            });

            expect(removeFromCart).not.toHaveBeenCalled();

        });

        it("deve retornar 401 quando o token for inválido", async () => {

            jwt.verify.mockImplementation(() => {
                throw new Error("Token inválido");
            });

            const response = await request(app)
                .delete("/cart/cart-item-123")
                .set("Authorization", "Bearer token-invalido");

            expect(response.status).toBe(401);

            expect(response.body).toEqual({
                error: "Token inválido"
            });

            expect(removeFromCart).not.toHaveBeenCalled();
        });
    });
});