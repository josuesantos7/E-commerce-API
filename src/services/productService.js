import prisma from "../database/prismaClient.js";

export const createProductService = async ({
    name, description, price, stock
}) => {

    const product = await prisma.product.create({
      data: { name, description, price, stock }
    });

    return product;
}

export const getProductsService = async (
    page = 1,
    limit = 10
) => {
    page = Number(page);
    limit = Number(limit);

    if (page < 1 || isNaN(page)) {
    page = 1;
    }

    if (limit > 100) {
    limit = 100;
    }

    if (isNaN(limit) || limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
        skip,
        take: limit,
        orderBy: {
        createdAt: "desc"
        }
    });

    const total = await prisma.product.count();

    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        data: products
    };
}

export const updateProductService = async (id, {
    name, description, price, stock
}) => {
    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price, stock }
    });
    return product;
}

export const deleteProductService = async (id) => {
    await prisma.product.delete({
        where: { id }
    });
}