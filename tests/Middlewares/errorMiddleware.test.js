import { describe, it, expect, vi } from "vitest";
import { errorMiddleware } from "../../src/middlewares/errorMiddleware.js";


describe("errorMiddleware", () => {

    it("deve retornar o status e mensagem do erro", () => {

        const error = {
            statusCode: 400,
            message: "Dados inválidos"
        };

        const req = {};
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        const next = vi.fn();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
            error: "Dados inválidos"
        });
    });

    it("deve retornar 500 quando o erro não possuir statusCode", () => {

        const error = {
            message: "Erro interno"
        };

        const req = {};

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            error: "Erro interno"
        });
    });

    it("deve retornar mensagem padrão quando o erro não possuir message", () => {

        const error = {};

        const req = {};

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
            error: "Erro interno do servidor"
        });
    });
});