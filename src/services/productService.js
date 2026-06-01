import prisma from "../database/prismaClient.js";

export const createProductService = async ({
    name, description, price, stock
}) => {

    const product = await prisma.product.create({
      data: { name, description, price, stock }
    });

    return product;
}

export const getProductsService = async () => {
    const products = await prisma.product.findMany();
    return products;
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