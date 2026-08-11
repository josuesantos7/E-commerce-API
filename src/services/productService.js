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
    limit = 10,
    search = "",
    minPrice,
    maxPrice,
    sort,
    order
) => {
    let orderBy = {
    createdAt: "desc"
    };

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

    const where = {};
    if (search) {
        where.OR = [
        {
            name: {
                contains: search,
                mode: "insensitive"
            }
        },
        {
            description: {
                contains: search,
                mode: "insensitive"
            }
        }
    ];
    }

    if (minPrice != null) {
        where.price = {
            gte: minPrice
        };
    }

    if (maxPrice != null) {
        where.price = {
            ...(where.price || {}),
            lte: maxPrice
        };
    }

    // Ordenação dinamica.
    const allowedSortFields = [
    "name",
    "price",
    "createdAt"
    ];

    const allowedOrders = [
    "asc",
    "desc"
    ];

    if (
    sort &&
    allowedSortFields.includes(sort) &&
    allowedOrders.includes(order)
    ) {
        orderBy = {
            [sort] : order
        }
    }

    const products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy
    });

    const total = await prisma.product.count({
        where
    });

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