import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../src/app.js";

import { getProductsService, createProductService } from "../../src/services/productService.js";

vi.mock("../../src/services/productService.js", () => ({
    createProductService: vi.fn(),
    getProductsService: vi.fn(),
    updateProductService: vi.fn(),
    deleteProductService: vi.fn()
}));

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

beforeEach(() => {
    vi.clearAllMocks();
});

describe("GET /products", () => {

    it("deve retornar os produtos com status 200", async () => {

        const products = {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            data: [
                {
                    id: "product-1",
                    name: "Notebook",
                    price: 3500
                },
                {
                    id: "product-2",
                    name: "Mouse",
                    price: 100
                }
            ]
        };

        getProductsService.mockResolvedValue(products);

        const response = await request(app)
            .get("/products");

        expect(response.status).toBe(200);

        expect(response.body).toEqual(products);

        expect(getProductsService).toHaveBeenCalledWith(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );

    });

    it("deve buscar produtos utilizando filtros, paginação e ordenação", async () => {

        const products = {
            page: 2,
            limit: 5,
            total: 1,
            totalPages: 2,
            data: [
                {
                    id: "product-1",
                    name: "Notebook",
                    price: 3500
                }
            ]
        };

        getProductsService.mockResolvedValue(products);

        const response = await request(app)
            .get("/products")
            .query({
                page: 2,
                limit: 5,
                search: "Notebook",
                minPrice: 1000,
                maxPrice: 5000,
                sort: "price",
                order: "asc"
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual(products);

        expect(getProductsService).toHaveBeenCalledWith(
            2,
            5,
            "Notebook",
            1000,
            5000,
            "price",
            "asc"
        );
    });

    it("deve retornar 400 quando page for inválido", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                page: "abc"
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando limit for maior que 100", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                limit: 101
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando limit for menor que 1", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                limit: 0
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando page for menor que 1", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                page: 0
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando minPrice for maior que maxPrice", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                minPrice: 5000,
                maxPrice: 1000
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando minPrice for negativo", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                minPrice: -1
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando maxPrice for negativo", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                maxPrice: -1
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando sort for inválido", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                sort: "invalid"
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando order for inválido", async () => {

        const response = await request(app)
            .get("/products")
            .query({
                order: "invalid"
            });

        expect(response.status).toBe(400);

        expect(getProductsService).not.toHaveBeenCalled();
    });
});

// Rota para Criar Produtos.
describe("POST /products", () => {

    it("deve criar produto quando o usuário for admin", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "admin"
        });

        const product = {
            id: "product-123",
            name: "Notebook",
            description: "Notebook de teste",
            price: 3500,
            stock: 10
        };

        createProductService.mockResolvedValue(product);

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual(product);

        expect(createProductService).toHaveBeenCalledWith({
            name: "Notebook",
            description: "Notebook de teste",
            price: 3500,
            stock: 10
        });

    });

    it("deve retornar 401 quando o token não for informado", async () => {

        const response = await request(app)
            .post("/products")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: "Token não informado"
        });

        expect(createProductService).not.toHaveBeenCalled();
    });

    it("deve retornar 403 quando o usuário não for admin", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "USER"
        });

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(403);

        expect(response.body).toEqual({
            error: "Acesso negado"
        });

        expect(createProductService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o nome não for informado", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "admin"
        });

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(400);

        expect(createProductService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o preço for negativo", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "admin"
        });

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: -100,
                stock: 10
            });

        expect(response.status).toBe(400);

        expect(createProductService).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o estoque for negativo", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "admin"
        });

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: -1
            });

        expect(response.status).toBe(400);

        expect(createProductService).not.toHaveBeenCalled();
    });

    it("deve retornar 401 quando o token for inválido", async () => {

        jwt.verify.mockImplementation(() => {
            throw new Error("Token inválido");
        });

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-invalido")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: "Token inválido"
        });

        expect(createProductService).not.toHaveBeenCalled();

    });

    it("deve retornar erro quando o Service falhar", async () => {

        jwt.verify.mockReturnValue({
            id: "user-123",
            role: "admin"
        });

        createProductService.mockRejectedValue(
            new Error("Erro ao criar produto")
        );

        const response = await request(app)
            .post("/products")
            .set("Authorization", "Bearer token-falso")
            .send({
                name: "Notebook",
                description: "Notebook de teste",
                price: 3500,
                stock: 10
            });

        expect(response.status).toBe(500);

        expect(createProductService).toHaveBeenCalled();
    });
});