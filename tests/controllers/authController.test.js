import { describe, it, expect, vi } from "vitest";
import { register, login } from "../../src/controllers/authController.js";


vi.mock("../../src/services/authService.js", () => ({
    registerService: vi.fn(),
    loginService: vi.fn()
}));

import { registerService, loginService } from "../../src/services/authService.js";

// Teste de registro de usuário
describe("authController - register", () => {

    it("deve registrar usuário e retornar 201", async () => {

        const user = {
            id: "user-1",
            name: "João",
            email: "joao@email.com"
        };

        registerService.mockResolvedValue(user);

        const req = {
            body: {
                name: "João",
                email: "joao@email.com",
                password: "123456"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await register(req, res, next);

        expect(registerService).toHaveBeenCalledWith(req, res);

        expect(res.status).toHaveBeenCalledWith(201);

        expect(res.json).toHaveBeenCalledWith(user);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o registerService lançar erro", async () => {

        const error = new Error("Usuário já existe");

        registerService.mockRejectedValue(error);

        const req = {
            body: {
                name: "João",
                email: "joao@email.com",
                password: "123456"
            }
        };

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };

        const next = vi.fn();

        await register(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

// Teste de login de usuário
describe("authController - login", () => {

    it("deve realizar login e retornar os dados do usuário", async () => {

        const loginResult = {
            user: {
                id: "user-1",
                name: "João",
                email: "joao@email.com"
            },
            token: "token-jwt"
        };

        loginService.mockResolvedValue(loginResult);

        const req = {
            body: {
                email: "joao@email.com",
                password: "123456"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await login(req, res, next);

        expect(loginService).toHaveBeenCalledWith(req, res);

        expect(res.json).toHaveBeenCalledWith(loginResult);

        expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next quando o loginService lançar erro", async () => {

        const error = new Error("Usuário ou senha inválidos");

        loginService.mockRejectedValue(error);

        const req = {
            body: {
                email: "joao@email.com",
                password: "senha-errada"
            }
        };

        const res = {
            json: vi.fn()
        };

        const next = vi.fn();

        await login(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.json).not.toHaveBeenCalled();
    });
});