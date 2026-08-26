import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../src/database/prismaClient.js";
import { loginService, registerService } from "../../src/services/authService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


vi.mock("../../src/database/prismaClient.js", () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn()
        }
    }
}));

vi.mock("bcrypt", () => ({
    default: {
        compare: vi.fn(),
        hash: vi.fn()
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

describe("registerService", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve registrar um usuário corretamente", async () => {

        const user = {
            id: "user-1",
            name: "João",
            email: "joao@email.com",
            password: "senha-hash",
            role: "USER"
        };

        prisma.user.findUnique.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("senha-hash");

        prisma.user.create.mockResolvedValue(user);

        const data = {
            name: "João",
            email: "joao@email.com",
            password: "123456"
        };

        const result = await registerService(data);

        expect(result).toEqual({
            id: "user-1",
            name: "João",
            email: "joao@email.com",
            role: "USER"
        });

        expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                name: "João",
                email: "joao@email.com",
                password: "senha-hash"
            }
        });
    });

    it("deve lançar erro quando o usuário já existir", async () => {

        prisma.user.findUnique.mockResolvedValue({
            id: "user-1",
            name: "João",
            email: "joao@email.com"
        });

        const data = {
            name: "João",
            email: "joao@email.com",
            password: "123456"
        };

        await expect(
            registerService(data)
        ).rejects.toThrow("Usuário já existe");

        expect(prisma.user.create).not.toHaveBeenCalled();

        expect(bcrypt.hash).not.toHaveBeenCalled();
    });
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

        const data = {
            email: "josue@email.com",
            password: "123456"
        };

        const result = await loginService(data);

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

        const data = {
            email: "naoexiste@email.com",
            password: "123456"
        };

        await expect(
            loginService(data)
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

        const data = {
            email: "josue@email.com",
            password: "senha-errada"
        };

        await expect(
            loginService(data)
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

        const data = {
            email: "joao@email.com",
            password: "123456"
        };

        const result = await loginService(data);

        expect(result.user).not.toHaveProperty("password");

    });

    it("deve gerar o token com id, role e expiração corretos", async () => {

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

        const data = {
            email: "joao@email.com",
            password: "123456"
        };

        await loginService(data);

        expect(jwt.sign).toHaveBeenCalledWith(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );
    });
});

