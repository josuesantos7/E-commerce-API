import { describe, it, expect } from "vitest";
import { getProductsSchema } from "../../src/schemas/getProductsSchema.js";


describe("getProductsSchema", () => {

    it("deve aceitar parâmetros válidos", () => {

        const result = getProductsSchema.safeParse({
            page: "1",
            limit: "10",
            search: "produto",
            minPrice: "100",
            maxPrice: "500",
            sort: "price",
            order: "asc"
        });

        expect(result.success).toBe(true);

        expect(result.data).toEqual({
            page: 1,
            limit: 10,
            search: "produto",
            minPrice: 100,
            maxPrice: 500,
            sort: "price",
            order: "asc"
        });
    });

    it("deve rejeitar page menor que 1", () => {

        const result = getProductsSchema.safeParse({
            page: "0"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "page deve ser maior ou igual a 1"
        );
    });

    // Teste parâmetro Page
    it("deve rejeitar page que não seja inteiro", () => {

        const result = getProductsSchema.safeParse({
            page: "1.5"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "page deve ser um número inteiro"
        );
    });

    it("deve rejeitar page que não seja um número válido", () => {

        const result = getProductsSchema.safeParse({
            page: "abc"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "page deve ser um número válido"
        );
    });

    // Teste parâmetro Limit
    it("deve rejeitar limit menor que 1", () => {

        const result = getProductsSchema.safeParse({
            limit: "0"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "limit deve ser maior ou igual a 1"
        );
    });

    it("deve rejeitar limit maior que 100", () => {

        const result = getProductsSchema.safeParse({
            limit: "101"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "limit deve ser menor ou igual a 100"
        );
    });

    it("deve rejeitar limit que não seja inteiro", () => {

        const result = getProductsSchema.safeParse({
            limit: "10.5"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "limit deve ser um número inteiro"
        );
    });

    it("deve rejeitar limit que não seja um número válido", () => {

        const result = getProductsSchema.safeParse({
            limit: "abc"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "limit deve ser um número válido"
        );
    });

    // Teste parâmetro minPrice e maxPrice
    it("deve rejeitar minPrice negativo", () => {

        const result = getProductsSchema.safeParse({
            minPrice: "-10"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "minPrice deve ser um número positivo"
        );
    });

    it("deve rejeitar minPrice que não seja um número válido", () => {

        const result = getProductsSchema.safeParse({
            minPrice: "abc"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "minPrice deve ser um número válido"
        );
    });

    it("deve rejeitar maxPrice negativo", () => {

        const result = getProductsSchema.safeParse({
            maxPrice: "-10"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "maxPrice deve ser um número positivo"
        );
    });

    it("deve rejeitar maxPrice que não seja um número válido", () => {

        const result = getProductsSchema.safeParse({
            maxPrice: "abc"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "maxPrice deve ser um número válido"
        );
    });

    it("deve rejeitar quando minPrice for maior que maxPrice", () => {

        const result = getProductsSchema.safeParse({
            minPrice: "500",
            maxPrice: "100"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "minPrice não pode ser maior que maxPrice"
        );
    });

    // Teste parâmetro sort
    it("deve rejeitar sort inválido", () => {

        const result = getProductsSchema.safeParse({
            sort: "invalidField"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "sort deve ser name, price ou createdAt"
        );
    });

    // Teste parâmetro order
    it("deve rejeitar order inválido", () => {

        const result = getProductsSchema.safeParse({
            order: "invalidOrder"
        });

        expect(result.success).toBe(false);

        expect(result.error.issues[0].message).toBe(
            "order deve ser asc ou desc"
        );
    });

    // Teste parâmetros opcionais
    it("deve aceitar quando nenhum parâmetro for informado", () => {

        const result = getProductsSchema.safeParse({});

        expect(result.success).toBe(true);

        expect(result.data).toEqual({});
    });
});