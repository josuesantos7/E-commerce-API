import { describe, it, expect, vi } from "vitest";
import prisma from "../../src/database/prismaClient.js";
import { loginService } from "../../src/services/authService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


vi.mock("../../src/database/prismaClient.js", () => ({
    default: {
        user: {
            findUnique: vi.fn()
        }
    }
}));

vi.mock("bcrypt", () => ({
    default: {
        compare: vi.fn()
    }
}));

vi.mock("jsonwebtoken", async () => {
    const actual = await vi.importActual("jsonwebtoken");

    return {
        ...actual,
        default: {
            ...actual.default,
            sign: vi.fn()
        }
    };
});

describe("loginService", () => {

    it("deve realizar login com credenciais válidas", async () => {
        const user = {
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "hash-da-senha",
            role: "USER"
        };

        prisma.user.findUnique.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue("token-falso-123");

        const req = {
            body: {
                email: "josue@email.com",
                password: "123456"
            }
        };

        const result = await loginService(req);

        expect(result.token).toBe("token-falso-123");

        expect(result.user).toEqual({
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            role: "USER"
        });
    });

    it("deve lançar erro quando o usuário não existir", async () => {

        prisma.user.findUnique.mockResolvedValue(null);

        const req = {
            body: {
                email: "naoexiste@email.com",
                password: "123456"
            }
        };

        await expect(
            loginService(req)
        ).rejects.toMatchObject({
            message: "Usuário ou senha inválidos",
            statusCode: 401
        });

    });

    it("deve lançar erro quando a senha estiver incorreta", async () => {

        const user = {
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "hash-da-senha",
            role: "USER"
        };

        prisma.user.findUnique.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(false);

        const req = {
            body: {
                email: "josue@email.com",
                password: "senha-errada"
            }
        };

        await expect(
            loginService(req)
        ).rejects.toMatchObject({
            message: "Usuário ou senha inválidos",
            statusCode: 401
        });

    });

    it("não deve retornar a senha do usuário", async () => {

        const user = {
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "hash-da-senha",
            role: "USER"
        };

        prisma.user.findUnique.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign.mockReturnValue("token-falso-123");

        const req = {
            body: {
                email: "josue@email.com",
                password: "123456"
            }
        };

        const result = await loginService(req);

        expect(result.user).not.toHaveProperty("password");

    });



});

