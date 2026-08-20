import { describe, it, expect, vi } from "vitest";
import { addToCart, getCart, removeFromCart } from "../../src/controllers/cartController.js";

vi.mock("../../src/services/cartService.js", () => ({
    addToCartService: vi.fn(),
    getCartService: vi.fn(),
    removeFromCartService: vi.fn()
}));

import { addToCartService, getCartService, removeFromCartService } from "../../src/services/cartService.js";

describe("cartController - addToCart", () => {

    it("deve adicionar produto ao carrinho e retornar 201", async () => {

        const item = {
            id: "cart-item-1",
            userId: "user-1",
            productId: "product-1",
            quantity: 2
        };

        addToCartService.mockResolvedValue(item);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-1",
                quantity: 2
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await addToCart(req, res, next);

        expect(addToCartService).toHaveBeenCalledWith(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith(item);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o addToCartService lançar erro", async () => {

        const error = new Error("Produto não encontrado");

        addToCartService.mockRejectedValue(error);

        const req = {
            userId: "user-1",
            body: {
                productId: "product-inexistente",
                quantity: 2
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await addToCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

});

describe("cartController - getCart", () => {

    it("deve retornar o carrinho do usuário", async () => {

        const cart = [
            {
                id: "cart-item-1",
                userId: "user-1",
                productId: "product-1",
                quantity: 2
            },
            {
                id: "cart-item-2",
                userId: "user-1",
                productId: "product-2",
                quantity: 1
            }
        ];

        getCartService.mockResolvedValue(cart);

        const req = {
            userId: "user-1"
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getCart(req, res, next);

        expect(getCartService).toHaveBeenCalledWith(req, res);

        expect(res.json).toHaveBeenCalledWith(cart);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o getCartService lançar erro", async () => {

        const error = new Error("Erro ao buscar carrinho");

        getCartService.mockRejectedValue(error);

        const req = {
            userId: "user-1"
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await getCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});

describe("cartController - removeFromCart", () => {

    it("deve remover item do carrinho", async () => {

        removeFromCartService.mockResolvedValue();

        const req = {
            params: {
                id: "cart-item-1"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await removeFromCart(req, res, next);

        expect(removeFromCartService).toHaveBeenCalledWith(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: "Item removido"
        });

        expect(next).not.toHaveBeenCalled();
    });

}); 

describe("cartController - removeFromCart", () => {

    it("deve remover item do carrinho", async () => {

        removeFromCartService.mockResolvedValue();

        const req = {
            params: {
                id: "cart-item-1"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await removeFromCart(req, res, next);

        expect(removeFromCartService).toHaveBeenCalledWith(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: "Item removido"
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o removeFromCartService lançar erro", async () => {

        const error = new Error("Item não encontrado");

        removeFromCartService.mockRejectedValue(error);

        const req = {
            params: {
                id: "item-inexistente"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await removeFromCart(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});