import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import prisma from "../../src/database/prismaClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



import app from "../../src/app.js";


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

beforeEach(() => {
    vi.clearAllMocks();
});

describe("POST /auth/login", () => {

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

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "josue@email.com",
                password: "123456"
            });

        expect(response.status).toBe(200);

        expect(response.body.token).toBe("token-falso-123");

        expect(response.body.user).toEqual({
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            role: "USER"
        });

    });

    it("deve retornar 400 quando o email não for informado", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({
                password: "123456"
            });

        expect(response.status).toBe(400);

    });

    it("deve retornar 400 quando a senha não for informada", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "josue@email.com"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando o email for inválido", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "email-invalido",
                password: "123456"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando a senha tiver menos de 6 caracteres", async () => {

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "josue@email.com",
                password: "123"
            });
        expect(response.status).toBe(400);

    });

    it("deve retornar 401 quando o usuário não existir", async () => {

        prisma.user.findUnique.mockResolvedValue(null);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "naoexiste@email.com",
                password: "123456"
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: "Usuário ou senha inválidos"
        });
    });

    it("deve retornar 401 quando a senha estiver incorreta", async () => {

        const user = {
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "hash-da-senha",
            role: "USER"
        };

        prisma.user.findUnique.mockResolvedValue(user);

        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "josue@email.com",
                password: "senha-incorreta"
            });

        expect(response.status).toBe(401);

        expect(response.body).toEqual({
            error: "Usuário ou senha inválidos"
        });
    });
});

describe("POST /auth/register", () => {
    it("deve criar usuário com dados válidos", async () => {

        prisma.user.findUnique.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("senha-hash");

        prisma.user.create.mockResolvedValue({
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "senha-hash",
            role: "USER"
        });

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                email: "josue@email.com",
                password: "123456"
            });

        expect(response.status).toBe(201);

        expect(response.body).toEqual({
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            role: "USER"
        });

        expect(response.body.password).toBeUndefined();

        expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                name: "Josué",
                email: "josue@email.com",
                password: "senha-hash"
            }
        });
    });

    it("deve retornar 409 quando o usuário já existir", async () => {

        prisma.user.findUnique.mockResolvedValue({
            id: "user-123",
            name: "Josué",
            email: "josue@email.com",
            password: "senha-hash",
            role: "USER"
        });

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                email: "josue@email.com",
                password: "123456"
            });

        expect(response.status).toBe(409);

        expect(response.body).toEqual({
            error: "Usuário já existe"
        });

        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("deve retornar 400 quando o nome não for informado", async () => {

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                email: "josue@email.com",
                password: "123456"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando o email não for informado", async () => {

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                password: "123456"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando a senha não for informada", async () => {

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                email: "josue@email.com"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando o email for inválido", async () => {

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                email: "email-invalido",
                password: "123456"
            });

        expect(response.status).toBe(400);
    });

    it("deve retornar 400 quando a senha tiver menos de 6 caracteres", async () => {

        const response = await request(app)
            .post("/auth/create-user")
            .send({
                name: "Josué",
                email: "josue@email.com",
                password: "123"
            });

        expect(response.status).toBe(400);
    });
});