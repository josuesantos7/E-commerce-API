import { describe, it, expect, vi } from "vitest";

import {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct
} from "../../src/controllers/productController.js";

vi.mock("../../src/services/productService.js", () => ({
    createProductService: vi.fn(),
    getProductsService: vi.fn(),
    updateProductService: vi.fn(),
    deleteProductService: vi.fn()
}));

import {
    createProductService,
    getProductsService,
    updateProductService,
    deleteProductService
} from "../../src/services/productService.js";


describe("productController - createProduct", () => {

    it("deve criar produto e retornar 201", async () => {

        const product = {
            id: "product-1",
            name: "Notebook",
            price: 3500
        };

        createProductService.mockResolvedValue(product);

        const req = {
            body: {
                name: "Notebook",
                price: 3500
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await createProduct(req, res, next);

        expect(createProductService).toHaveBeenCalledWith(req.body);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith(product);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o createProductService lançar erro", async () => {

        const error = new Error("Produto já existe");

        createProductService.mockRejectedValue(error);

        const req = {
            body: {
                name: "Notebook",
                price: 3500
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("productController - getProducts", () => {

    it("deve buscar produtos usando os parâmetros validados", async () => {

        const products = [
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
        ];

        getProductsService.mockResolvedValue(products);

        const req = {
            validated: {
                query: {
                    page: 1,
                    limit: 10,
                    search: "note",
                    minPrice: 100,
                    maxPrice: 5000,
                    sort: "price",
                    order: "asc"
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await getProducts(req, res, next);

        expect(getProductsService).toHaveBeenCalledWith(
            1,
            10,
            "note",
            100,
            5000,
            "price",
            "asc"
        );

        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith(products);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o getProductsService lançar erro", async () => {

        const error = new Error("Erro ao buscar produtos");

        getProductsService.mockRejectedValue(error);

        const req = {
            validated: {
                query: {
                    page: 1,
                    limit: 10,
                    search: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    sort: undefined,
                    order: undefined
                }
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await getProducts(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

});

describe("productController - updateProduct", () => {

    it("deve atualizar o produto e retornar o produto atualizado", async () => {

        const product = {
            id: "product-1",
            name: "Notebook atualizado",
            price: 4000
        };

        updateProductService.mockResolvedValue(product);

        const req = {
            params: {
                id: "product-1"
            },
            body: {
                name: "Notebook atualizado",
                price: 4000
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await updateProduct(req, res, next);

        expect(updateProductService).toHaveBeenCalledWith(
            "product-1",
            req.body
        );

        expect(res.json).toHaveBeenCalledWith(product);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o updateProductService lançar erro", async () => {

        const error = new Error("Produto não encontrado");

        updateProductService.mockRejectedValue(error);

        const req = {
            params: {
                id: "product-inexistente"
            },
            body: {
                name: "Notebook atualizado",
                price: 4000
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await updateProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("productController - deleteProduct", () => {

    it("deve deletar o produto e retornar mensagem de sucesso", async () => {

        deleteProductService.mockResolvedValue();

        const req = {
            params: {
                id: "product-1"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await deleteProduct(req, res, next);

        expect(deleteProductService).toHaveBeenCalledWith("product-1");

        expect(res.json).toHaveBeenCalledWith({
            message: "Produto deletado com sucesso."
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o deleteProductService lançar erro", async () => {

        const error = new Error("Produto não encontrado");

        deleteProductService.mockRejectedValue(error);

        const req = {
            params: {
                id: "product-inexistente"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await deleteProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});