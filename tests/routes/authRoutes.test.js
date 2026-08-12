import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import prisma from "../../src/database/prismaClient.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



import app from "../../src/app.js";


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


});