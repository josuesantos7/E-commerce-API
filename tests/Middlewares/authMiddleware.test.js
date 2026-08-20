import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../src/middlewares/authMiddleware.js";


vi.mock("jsonwebtoken", () => ({
    default: {
        verify: vi.fn()
    }
}));

describe("authMiddleware", () => {

    it("deve retornar 401 quando o token não for informado", () => {

        const req = {
            headers: {}
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: "Token não informado"
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve retornar 401 quando o token for inválido", () => {

        jwt.verify.mockImplementation(() => {
            throw new Error("Token inválido");
        });

        const req = {
            headers: {
                authorization: "Bearer token-invalido"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            error: "Token inválido"
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir acesso quando o token for válido", () => {

        jwt.verify.mockReturnValue({
            id: "user-1",
            role: "USER"
        });

        const req = {
            headers: {
                authorization: "Bearer token-valido"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            "token-valido",
            process.env.JWT_SECRET
        );

        expect(req.userId).toBe("user-1");
        expect(req.userRole).toBe("USER");

        expect(next).toHaveBeenCalled();

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});