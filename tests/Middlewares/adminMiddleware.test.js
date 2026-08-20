import { describe, it, expect, vi } from "vitest";
import { adminMiddleware } from "../../src/middlewares/adminMiddleware.js";


describe("adminMiddleware", () => {

    it("deve retornar 403 quando o usuário não for admin", () => {

        const req = {
            userRole: "USER"
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        adminMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            error: "Acesso negado"
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("deve permitir acesso quando o usuário for admin", () => {

        const req = {
            userRole: "admin"
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        adminMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});